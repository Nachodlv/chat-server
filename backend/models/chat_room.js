
class ChatRoom {
    name: string;
    messages: string[];
    id: number;
    users: User[];

    constructor(name: string, ownerId: number) {
        this.name = name;
        this.messages = [];
        this.ownerId = ownerId;
        this.users = [];
    }

}

module .exports = ChatRoom;
