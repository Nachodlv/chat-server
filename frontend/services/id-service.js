export class IdService {
    id: string;

    constructor(ip: string = undefined) {
        this.id = undefined;
    }


    getId(success: (number) => void, error: (string) => void) {
        if(this.id) success(this.id);
        else this.makeRequest((id) => success(id), error)
    }


    makeRequest(success: (string) => void, error: (string) => void) {
        $.ajax({
            type: "GET",
            url: "/id",
            processData: false,
            success: (msg) => {
                console.log(msg);
                this.id = msg;
                success(this.id);
            },
            error: () => {
                error("Something went wrong");
            }
        });
    }
}
