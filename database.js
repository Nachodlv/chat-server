class DatabaseConnection {

    host: string;

    constructor(request) {
        const api: string = "/dbapi/v3";
        this.host = process.env.DB_HOST + api;
        this.userInfo = {
            "userid": process.env.DB_USER,
            "password": process.env.DB_PASSWORD
        };
        this.request = request;
    }

    connect(callback: (token: string, error: string) => void) {
        this.request.post({url: this.host + "/auth/tokens", form: JSON.stringify(this.userInfo)}, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                console.log("Connected to database");
                callback(JSON.parse(body).token);
            } else {
                console.log("Error connecting to database");
                console.log(body);
                callback(undefined, error);
            }
        });
    }


}

module.exports = DatabaseConnection;

