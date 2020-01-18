class Db2Service {
    url: string;

    constructor(authHeader: any, request) {
        this.request = request;
        this.authHeader = authHeader;

        this.url = process.env.DB_HOST + "/dbapi/v3/sql_jobs";
    }

    generateSql(query: string, limited: boolean) {
        const result = {
            "commands": query,
            "separator": ";",
            "stop_on_error": "yes"
        };
        if (limited) result['limit'] = 1;
        return result;
    }

    executeSql(query: string, callback: (body: any, error: string) => void, limited: boolean = true) {
        this.request.post({
            url: this.url,
            json: this.generateSql(query, limited),
            headers: this.authHeader
        }, (error, response, body) => {
            if (!error && response.statusCode === 201) {
                this.request.get({url: this.url + "/" + body.id, headers: this.authHeader}, (error2, response2, body2) => {
                    if (!error2 && response2.statusCode === 200) {
                        callback(JSON.parse(body2));
                    } else callback(undefined, error2);
                });
            } else callback(undefined, error);
        });
    }
}

module.exports = Db2Service;
