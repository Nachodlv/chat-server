import User from "./user";

export class ChatRoom {
    name: string;
    message: string[];
    id: number;
    users: User[];

    constructor(name: string, ownerId: number) {
        this.name = name;
        this.messages = [];
        this.ownerId = ownerId;
        this.id = id;
        this.users = [];
    }

}