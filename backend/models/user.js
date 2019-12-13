/*
* Class for the user that interacts with application.
* */

class User {
    name: string;
    online: boolean;
    id: number;
    chatRooms: number[];

    constructor(data: any) {
        this.name = data.name;
        this.online = data.online;
        this.id = data.id;
        this.chatRooms = data.chatRooms === undefined ? [] : data.chatRooms;
    }
}

module.exports = User;
