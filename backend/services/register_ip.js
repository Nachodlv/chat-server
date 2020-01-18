class RegisterIp {
    ip: string;
    port: string;

    constructor(port: string, request, ip: string) {
        this.ip = ip;
        this.port = port;
        this.request = request;
        this.registerIp();
    }

    registerIp() {
        this.request.post({
            url: this.ip + "/ip",
            json: {port: this.port},
            headers: {
                "Content-Type": "application/json"
            },
            agentOptions: {
                rejectUnauthorized: false
            },
        }, (error, httpResponse, body) => {
            if (httpResponse && httpResponse.statusCode === 200) {
                console.log(body)
            } else {
                console.log(error)
            }
        });

    }
}

module.exports = RegisterIp;
