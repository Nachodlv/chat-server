export class IpService {
    ip: string;
    id: number;
    ipExternalService: string;
    constructor(ip: string = undefined) {
        this.ip = ip;
        this.id = undefined;
        this.ipExternalService = "https://localhost:1234"; //TODO change me
    }

    getIp(success: (string) => void, error: (string) => void) {
        if(this.ip) success(this.ip);
        else this.makeRequest((ip, _) => success(ip), error)
    }

    getId(success: (number) => void, error: (string) => void) {
        if(this.id) success(this.id);
        else this.makeRequest((_, id) => success(id), error)
    }

    getIpAndId(success: (string, number) => void, error: (string) => void) {
        if(this.id && this.ip) success(this.ip, this.ip);
        else this.makeRequest(success, error);
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
                this.ip = "https://" + msg.ip + (msg.port? `:${msg.port}`:"");
                this.id = msg.id;

                success(this.ip, this.id);
            },
            error: () => {
                error("Something went wrong");
            }
        });
    }
}
