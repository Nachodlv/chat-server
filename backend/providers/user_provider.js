class UserProvider {

    constructor(User, db2Service: Db2Service) {
        this.User = User;
        this.db2Service = db2Service;
        //TEST
        /*this.createUser(new User(
            ["", "Pepe", "false","password123", "/Users/gianni/Projects/facultad/cloud-computing/chat-server-2/.tmp/uploads/24bd52ba-e6b6-4058-bc2e-defaf2ed850b.jpg"]
        ), (newUser, error) => {
            console.log(newUser)
        })*/
    }

    getUser(name: string, callback: (user: User, error: string) => void) {
        this.db2Service.executeSql(`SELECT * FROM QQL85939.user where name='${name}'`, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    this.getUserChatRooms(body.results[0].rows[0][0],body.results[0].rows[0], callback)
                } else callback(undefined, "No user was found with that name");
            } else {
                callback(undefined, "An error occurred while trying to get the user")
            }
        });
    }

    createUser(user: User, callback: (user: User, error: string) => void) {
        this.db2Service.executeSql(`SELECT ID FROM FINAL TABLE (INSERT INTO QQL85939.USER (NAME, PASSWORD, ONLINE, IMGPATH) 
                                VALUES ('${user.name}', '${user.password}', ${user.online}, '${user.imgPath};'))`,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    user.id = Number(body.results[0].rows[0][0]);
                    callback(user, "");
                } else callback(undefined, "Error occurred while trying to create the user")
            });
    }

    getUserById(id: string, callback: (user: User, error: string) => void) {
        this.db2Service.executeSql("SELECT * FROM QQL85939.user where id = " + id, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    this.getUserChatRooms(body.results[0].rows[0][0], body.results[0].rows[0], callback)
                } else callback(undefined, "No user was found with that id");
            } else callback(undefined, "An error occurred while trying to get the user " + id);
        });
    }

    getUserChatRooms(userId: number, userRow: any, callback: (user: User, error: string) => void) {
        this.db2Service.executeSql(`SELECT * FROM QQL85939.USER_CHAT_ROOM where USER_ID='${userId}'`, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    callback(this.userTableToModel(userRow, body.results[0].rows));
                } else callback(this.userTableToModel(userRow));
            } else {
                callback(undefined, "An error occurred while trying to get the user's chat rooms")
            }
        }, false);
    }

    updateUser(user: User, callback: (user: User, error: string) => void) {
        // this.updateChatRooms(user);
        this.db2Service.executeSql(`UPDATE QQL85939.USER SET ONLINE = ${user.online} WHERE ID = ${user.id}`, (body, error) => {
            if(body.results.length > 0 && body.results[0].rows_affected === 1) {
                callback(user);
            } else callback(undefined, "An error occurred while trying to update the user");
        });
    }

    /*updateChatRooms(user: User): any {
        this.userChatRooms[user.id] = user.chatRooms;
    }*/

    userTableToModel(userRow: any, chatRoomRows: any = []): User {
        userRow.chatRooms = chatRoomRows.map(row => Number(row[1]));
        return new this.User(userRow);
    }
}

module.exports = UserProvider;
