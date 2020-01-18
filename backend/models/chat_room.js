
class ChatRoom {
    name: string;
    messages: Message[];
    id: number;
    users: User[];

    constructor(name: string, ownerId: number, id?: number, users?: User[], messages: Message[]) {
        this.id = id;
        this.name = name;
        this.messages = messages ? messages : [];
        this.ownerId = ownerId;
        this.users = users ? users : [];
    }

}

module .exports = ChatRoom;
