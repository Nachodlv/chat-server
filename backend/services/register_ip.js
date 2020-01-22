class RegisterIp {
    ip: string;
    host: string;

    constructor(host: string, request, ip: string) {
        this.ip = ip;
        this.host = host;
        this.request = request;
        this.registerIp();
    }

    registerIp() {
        this.request.post({
            url: this.ip + "/ip",
            json: {host: this.host},
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
