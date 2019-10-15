/*
* Class for the user that interacts with application.
* */
class User {
    constructor(name) {
        this.name = name;
        this.online = true;
        this.id = 0;
    }
}

module.exports = User;