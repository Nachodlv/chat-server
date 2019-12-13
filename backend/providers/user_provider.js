class UserProvider {

    getByIdQuery: string;
    newQuery: string;
    getByNameQuery: string;
    updateQuery: string;
    userChatRooms: Map<number, number[]>;

    constructor(connection, User) {
        this.connection = connection;
        this.User = User;
        this.userChatRooms = new Map();

        this.getByIdQuery = "SELECT * FROM user where id = ?";
        this.newQuery = "INSERT INTO user set ?";
        this.getByNameQuery = "SELECT * FROM user where name = ?";
        this.updateQuery = "UPDATE user SET online = ? WHERE id = ?";
    }

    getUser(name: string, callback: (user: User, error: string) => void) {
        this.connection.query(this.getByNameQuery, name, (error, response, _) => {
            if (!error && response.length > 0) {
                callback(this.userTableToModel(response[0]));
            } else {
                callback(undefined, "An error occurred while trying to get the user")
            }
        });
    }

    createUser(user: User, callback: (user: User, error: string) => void) {
        this.connection.query(this.newQuery, this.userModelToTable(user), (error, response) => {
            if (!error && response !== undefined) {
                if(response.insertId) user.id = response.insertId;
                callback(user, "");
            } else callback(undefined, "Error occurred while trying to create the user")
        });
    }

    getUserById(id: string, callback: (user: User, error: string) => void) {
        this.connection.query(this.getByIdQuery, id, (error, response) => {
            if (!error && response.length > 0) {
                callback(this.userTableToModel(response[0]));
            } else callback(undefined, "An error occurred while trying to get the user " + id);
        });
    }

    updateUser(user: User, callback: (user: User, error: string) => void) {
        this.connection.query(this.updateQuery, [this.userModelToTable(user), user.id], (error, response) => {
            if (!error && response !== undefined) {
                if(response.insertId) user.id = response.insertId;
                callback(user, "");
            } else callback(undefined, "An error occurred while trying to update the user");
        });
    }

    userModelToTable(user: User): any {
        this.userChatRooms[user.id] = user.chatRooms;
        return {
            id: user.id,
            name: user.name,
            online: user.online
        }
    }

    userTableToModel(user: any): User {
        user.chatRooms = this.userChatRooms[user.id];
        return new this.User(user);
    }
}

module.exports = UserProvider;
