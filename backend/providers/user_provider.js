class UserProvider {

    baseUrl: string = "https://chat-server-8c505.firebaseio.com/user.json";

    constructor(request) {
        this.request = request;
    }

    getUser(name: string, callback: (user: User, error: string) => void) {
        this.request({url: this.baseUrl + "?orderBy=\"name\"&equalTo=\"" + name + "\""}, (error, response, _) => {
            if(!error && response.statusCode === 200) {
                const user: User = JSON.parse(response.body)[0];
                if(user !== undefined) callback(user);
                else callback(undefined, "No user was found with that name");
            } else {
                callback(undefined, "An error occurred while trying to get the user")
            }
        });
    }

    createUser(user: User, callback: (user: User, error: string) => void) {
        //TODO implement me
    }

    getUserById(id: string, callback: (user: User, error: string) => void) {

    }

    updateUser(user: User, callback: (user: User, error: string) => void) {

    }
}

module.exports = UserProvider;
