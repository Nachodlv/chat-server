class UserProvider {

    userChatRooms: Map<number, number[]>;
    url: string;

    constructor(databaseConnection: DatabaseConnection, User, request) {
        this.request = request;
        this.User = User;
        this.userChatRooms = new Map();
        databaseConnection.connect((token, _) => {
            this.authHeader = {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            };
        });
        this.url = process.env.DB_HOST + "/dbapi/v3/sql_jobs";
    }

    getUser(name: string, callback: (user: User, error: string) => void) {
        this.executeSql(`SELECT * FROM GXQ26433.user where name='${name}'`, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    callback(this.userTableToModel(body.results[0].rows[0]));
                } else callback(undefined, "No user was found with that name");
            } else {
                callback(undefined, "An error occurred while trying to get the user")
            }
        });
    }

    createUser(user: User, callback: (user: User, error: string) => void) {
        this.executeSql(`SELECT ID FROM FINAL TABLE (INSERT INTO GXQ26433.USER (NAME, PASSWORD, ONLINE, IMGPATH) 
                                VALUES ('${user.name}', '${user.password}', ${user.online}, '${user.imgPath};'))`,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    user.id = Number(body.results[0].rows[0][0]);
                    callback(user, "");
                } else callback(undefined, "Error occurred while trying to create the user")
            });
    }

    getUserById(id: string, callback: (user: User, error: string) => void) {
        this.executeSql("SELECT * FROM GXQ26433.user where id = " + id, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    callback(this.userTableToModel(body.results[0].rows[0]));
                } else callback(undefined, "No user was found with that id");
            } else callback(undefined, "An error occurred while trying to get the user " + id);
        });
    }

    updateUser(user: User, callback: (user: User, error: string) => void) {
        this.updateChatRooms(user);
        this.executeSql(`UPDATE GXQ26433.USER SET ONLINE = ${user.online} WHERE ID = ${user.id}`, (body, error) => {
            if(body.results.length > 0 && body.results[0].rows_affected === 1) {
                callback(user);
            } else callback(undefined, "An error occurred while trying to update the user");
        });
    }

    updateChatRooms(user: User): any {
        this.userChatRooms[user.id] = user.chatRooms;
    }

    userTableToModel(user: any): User {
        user.chatRooms = this.userChatRooms[user[0]];
        return new this.User(user);
    }

    generateSql(query: string) {
        return {
            "commands": query,
            "limit": 1,
            "separator": ";",
            "stop_on_error": "yes"
        }
    }

    executeSql(query: string, callback: (body: any, error: string) => void) {
        this.request.post({
            url: this.url,
            json: this.generateSql(query),
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

module.exports = UserProvider;
