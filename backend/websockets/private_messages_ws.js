/*
* Web socket used to send and receive private messages such as whispers and multicast.
* */
module.exports = class PrivateMessagesWebSocket {
    userProvider: Provider;
    Message: Message;

    constructor(io, userProvider: Provider, Message: Message, MessageType: MessageType, chatWs: ChatWebSocket) {
        this.userProvider = userProvider;
        this.Message = Message;
        this.MessageType = MessageType;
        this.namespace = io.of('/');
        this.chatWs = chatWs;
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
        socket.on('private message', (message: PrivateMessage) => {
            message.userIds.forEach(id => this.namespace.to(id).emit('private message', message));
        });
    }
};