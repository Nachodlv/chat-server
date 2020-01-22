class ObjectStorageService {
    url: string;

    CONFIG: any;
    IBMCOS: any;
    rp: any;
    encryptionService: EncryptionService;
    S3: any;

    constructor(OBJSTORAGECRED, IBMCOS, rp, encryptionService) {
        this.CONFIG = {
            useHmac: false,
            bucketName: 'chat-files-5u-cos-standard-i1e',
            serviceCredential: OBJSTORAGECRED,
        };
        this.IBMCOS = IBMCOS;
        this.rp = rp;
        this.encryptionService = encryptionService;
    }

    async init() {

        const defaultEndpoint = 's3.us-south.cloud-object-storage.appdomain.cloud';

        const s3 = await this.getS3(defaultEndpoint, this.CONFIG.serviceCredential);

        /* Fetch the Extended bucket Info for the selected bucket.
         * This call will give us the bucket's Location
         */
        const data = await this.listBuckets(s3, this.CONFIG.bucketName);
        const bucket = data.Buckets[0];

        /* Fetch all the available endpoints in Cloud Object Storage
         * We need to find the correct endpoint to use based on our bucjket's location
         */
        const endpoints = await this.getEndpoints(this.CONFIG.serviceCredential.endpoints);

        /* Find the correct endpoint and set it to the S3 Client
         * We can skip these steps and directly assign the correct endpoint if we know it
         */
        s3.endpoint = this.findBucketEndpoint(bucket, endpoints);

        this.S3 = s3;
        return true;
    };



    async getS3(endpoint, serviceCredential) {
        let s3Options;

        if (serviceCredential.apikey) {
            /*
               * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
               * An IAM APIKey can be used to create an S3 Object as below.
               * The APIKey, S3 endpoint and resource Instance Id are required
               */
            s3Options = {
                apiKeyId: serviceCredential.apikey,
                serviceInstanceId: serviceCredential.resource_instance_id,
                region: 'ibm',
                endpoint: new this.IBMCOS.Endpoint(endpoint),
            };
        } else {
            throw new Error('IAM ApiKey required to create S3 Client');
        }

        console.info(' S3 Options Used: \n', s3Options);
        console.debug('\n\n ================== \n\n');
        return new this.IBMCOS.S3(s3Options);
    };

    /*
     * Cloud Object Storage is available in 3 resiliency across many Availability Zones across the world.
     * Each AZ will require a different endpoint to access the data in it.
     * The endpoints url provides a JSON consisting of all Endpoints for the user.
     */
    async getEndpoints(endpointsUrl) {
        console.info('======= Getting Endpoints =========');

        const options = {
            url: endpointsUrl,
            method: 'GET'
        };
        const response = await this.rp(options);
        return JSON.parse(response);
    };

    /*
     * Once we have the available endpoints, we need to extract the endpoint we need to use.
     * This method uses the bucket's LocationConstraint to determine which endpoint to use.
     */
    findBucketEndpoint(bucket, endpoints) {
        const region = bucket.region || bucket.LocationConstraint.substring(0, bucket.LocationConstraint.lastIndexOf('-'));
        const serviceEndpoints = endpoints['service-endpoints'];
        const regionUrls = serviceEndpoints['cross-region'][region]
            || serviceEndpoints.regional[region]
            || serviceEndpoints['single-site'][region];

        if (!regionUrls.public || Object.keys(regionUrls.public).length === 0) {
            return '';
        }
        return Object.values(regionUrls.public)[0];
    };

    /*
     * The listBucketsExtended S3 call will return a list of buckets along with the LocationConstraint.
     * This will help in identifing the endpoint that needs to be used for a given bucket.
     */
    async listBuckets(s3, bucketName) {
        const params = {
            Prefix: bucketName
        };
        console.error('\n Fetching extended bucket list to get Location');
        const data = await s3.listBucketsExtended(params).promise();
        console.info(' Response: \n', JSON.stringify(data, null, 2));

        return data;
    };

    /*
     * A simple putObject to upload a simple object to COS.
     * COS also allows Multipart upload to facilitate upload of larger objects.
     */
    putObject(encryptionKey: string, fileName: string, fileType: string, fileSize: string, body: any, callback: (result: any, error) => void){
        this.encryptionService.hashFileName(encryptionKey+fileName, (fileKey) => {
            if (fileKey === undefined){
                callback(undefined, "Error hashing the file name.")
            } else if(this.S3) {
                this.putObjectAsync(this.S3, fileKey, fileType, fileSize, body).then(data => {
                    callback(fileKey)
                }).catch(err => callback(undefined, err))
            } else {
                this.init().then(() => {
                    this.putObjectAsync(this.S3, fileKey, fileType, fileSize, body).then( data => {
                        callback(fileKey)
                    })
                }).catch(err => callback(undefined, err))
            }
        });
    }

    async putObjectAsync(s3, fileKey: string, fileType: string, fileSize: string, body: any) {
        const params = {
            Bucket: this.CONFIG.bucketName,
            Key: fileKey,
            Body: body,
            Metadata: {
                fileType: fileType,
                fileSize: fileSize
            }
        };
        console.info(' putting Object \n', params.Key);

        const data = await Promise.all([
            s3.putObject(params).promise()
        ]);
        console.info(' Response: \n', JSON.stringify(data, null, 2));
        return data;
    };

    /*
     * Download an Object from COS
     */
    getObject(fileKey, callback: (result: any, error) => void) {
        if(this.S3) {
            this.getObjectAsync(this.S3, this.CONFIG.bucketName, fileKey).then(data => {
                callback(data)
            }).catch(err => callback(undefined, err))
        } else {
            this.init().then(() => {
                this.getObjectAsync(this.S3, this.CONFIG.bucketName, fileKey).then( data => {
                    callback(data)
                })
            }).catch(err => callback(undefined, err))
        }
    }

    async getObjectAsync(s3, bucketName, fileKey) {
        const getObjectParam = {
            Bucket: bucketName,
            Key: fileKey
        };
        console.info(' getObject \n', getObjectParam);

        return await s3.getObject(getObjectParam).promise();
        // console.info(' Response: \n', JSON.stringify(data, null, 2));
    };

    /*
    * Delete a selected Object
    */
    deleteObject(objectName, callback: (result: any, error) => void) {
        if(this.S3) {
            this.deleteObjectAsync(this.S3, this.CONFIG.bucketName, objectName).then(data => {
                callback(data)
            }).catch(err => callback(undefined, err))
        } else {
            this.init().then(() => {
                this.deleteObjectAsync(this.S3, this.CONFIG.bucketName, objectName).then( data => {
                    callback(data)
                })
            }).catch(err => callback(undefined, err))
        }
    }

    async deleteObjectAsync(s3, bucketName, objectName) {
        const deleteObjectP = {
            Bucket: bucketName,
            Key: objectName
        };
        console.info(' deleteObject \n', deleteObjectP);

        const data = await s3.deleteObject(deleteObjectP).promise();
        console.info(' Response: \n', JSON.stringify(data, null, 2));
        return data;
    };
}

module.exports = ObjectStorageService;
