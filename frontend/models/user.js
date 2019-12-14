/*
* Class for the user that interacts with application.
* */
// import {ChatRoom} from "./chat_room";

export default class User {
    name: string;
    password: string;
    imgPath: string;
    online: boolean;
    id: number;
    chatRooms: number[];

    constructor(name: string, password: string, imgPath?: string) {
        this.name = name;
        this.password = password;
        this.imgPath = imgPath ? imgPath : '';
        this.online = false;
        this.id = 0;
        this.chatRooms = [];
    }
}
