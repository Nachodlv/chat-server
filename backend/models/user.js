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
        this.id = Number(data[0]);
        this.name = data[1];
        this.online = Boolean(data[2]);
        this.password = data[3];
        this.imgPath = data[4];
        this.chatRooms = data.chatRooms === undefined ? [] : data.chatRooms;
    }
}

module.exports = User;
