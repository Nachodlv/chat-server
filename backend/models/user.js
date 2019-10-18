/*
* Class for the user that interacts with application.
* */

class User {
    name: string;
    online: boolean;
    id: number;
    chatRooms: number[];

    constructor(name: string) {
        this.name = name;
        this.online = true;
        this.id = 0;
        this.chatRooms = [];
    }
}

module.exports = User;