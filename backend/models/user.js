/*
* Class for the user that interacts with application.
* */

class User {
    name: string;
    password: string;
    imgPath: string;
    online: boolean;
    id: number;
    chatRooms: number[];

    constructor(data: any) {
        this.name = data.name;
        this.password = data.password;
        this.imgPath = data.imgPath;
        this.online = data.online;
        this.id = data.id;
        this.chatRooms = data.chatRooms === undefined ? [] : data.chatRooms;
    }
}

module.exports = User;
