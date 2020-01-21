export class IpService {
    ip: string;
    id: number;
    ipExternalService: string;
    constructor(ip: string = undefined) {
        this.ip = ip;
        this.id = undefined;
        this.ipExternalService = "https://mini-etcd.eu-de.mybluemix.net/"; //TODO change me
    }

    getIp(success: (string) => void, error: (string) => void) {
        if(this.ip) success(this.ip);
        else this.makeRequest((ip, _) => success(ip), error)
    }

    getId(success: (number) => void, error: (string) => void) {
        if(this.id) success(this.id);
        else this.idRequest(success, error)
    }

    getIpAndId(success: (string, number) => void, error: (string) => void) {
        if(this.id && this.ip) success(this.ip, this.ip);
        else this.makeRequest(success, error);
    }

    idRequest(success: (number) => void, error:(string) => void) {
        $.ajax({
            type: "GET",
            beforeSend: (request) => {
                request.setRequestHeader("Access-Control-Allow-Origin", "*");
                request.withCredentials = true;
            },
            url: this.ipExternalService + "/id",
            processData: false,
            success: (msg) => {
                this.id = msg;
                success(this.id);
            },
            error: () => {
                error("Something went wrong");
            }
        });
    }

    makeRequest(success: (string, number) => void, error: (string) => void) {
        $.ajax({
            type: "GET",
            beforeSend: (request) => {
                request.setRequestHeader("Access-Control-Allow-Origin", "*");
                request.withCredentials = true;
            },
            url: this.ipExternalService + "/ip",
            processData: false,
            success: (msg) => {
                this.ip = msg.ip;
                this.id = msg.id;

                success(this.ip, this.id);
            },
            error: () => {
                error("Something went wrong");
            }
        });
    }
}
