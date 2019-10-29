/*
* Web socket used to send and receive private messages such as whispers and multicast.
* */
module.exports = class PrivateMessagesWebSocket {
    privateMessageProvider: Provider;
    roomProvider: Provider;

    constructor(io, privateMessageProvider: Provider, roomProvider: Provider) {
        this.privateMessageProvider = privateMessageProvider;
        this.roomProvider = roomProvider;
        this.namespace = io.of('/');
        this.assignCallbacks();
    }

    /*
    * Assign callback for the connection of the users in the default socket.
    * */
    assignCallbacks() {
        this.namespace.on('connection', (socket) => {
            this.onWhisper(socket);
        });
    }

    /*
    * When a private message is received it sends the message to the corresponding users.
    * */
    onWhisper(socket) {
        socket.on('private message', (message: PrivateMessage | PrivateFileMessage, onError: (message: string) => void) => {
            this.privateMessageProvider.createModel(message);
            const room: ChatRoom = this.roomProvider.getModel(message.roomId);
            const users: User[] = room.users;
            let successful: boolean = true;
            let errorOnUser: string = '';
            const ids: number[] = message.nicknames.map(name => {
                const user: User = users.find(user => user.name === name);
                if(user) return user.id;
                errorOnUser = name;
                successful = false;
            });
            if(!successful) {
                onError(`The user ${errorOnUser} is not present in the room`);
                return
            }

            if (message.messageType === 'PrivateMultimedia')
                ids.forEach(id => this.namespace.to(id).emit('private file message', message));
            else ids.forEach(id => this.namespace.to(id).emit('private message', message));

            console.log(`${message.nicknames}(${message.userName}): ${message.text}`);
        });
    }
};
