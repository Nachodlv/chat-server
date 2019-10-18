export class ChatRoom {
    name: string;
    messages: Message[];
    id: number;
    users: User[];

    constructor(name: string, ownerId: number) {
        this.name = name;
        this.messages = [];
        this.ownerId = ownerId;
        this.users = [];
        this.id = undefined;
    }

}
