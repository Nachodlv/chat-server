/*
* Class for the user that interacts with application.
* */
// import {ChatRoom} from "./chat_room";

export default class User {
    name: string;
    online: boolean;
    id: number;
    chatRooms: number[];

    constructor(name: string) {
        this.name = name;
        this.online = false;
        this.id = 0;
        this.chatRooms = [0]; // TODO delete, testing purposes only
    }
}
