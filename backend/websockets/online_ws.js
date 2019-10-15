/*
* Web socket to check if an user is online or offline.
* */

module.exports = class OnlineWebSocket {
    userProvider: Provider;
    chatWebSocket: ChatWebSocket;
    Message: Message;

    constructor(io, userProvider: Provider, chatWebSocket: ChatWebSocket, Message: Message) {
        this.userProvider = userProvider;
        this.chatWebSocket = chatWebSocket;
        this.Message = Message;
        this.assignCallbacks(io);
    }

    /*
    * Assign callback for the connection and disconnection of the users in the default socket.
    * Retrieves the user id in the socket handshake provided by the client connecting.
    * If the user does not exists the callback is ended.
    * */
    assignCallbacks(io) {
        io.on('connection', (socket) => {
            const userId: number = Number(socket.handshake.query['userId']);
            const user: User = this.userProvider.getModel(userId);
            if (!user) return;
            this.onConnection(user);
            socket.on('disconnect', () => this.onDisconnect(user));
        });
    }

    /*
    * Send a message to the chat rooms the user is part of saying it is connected.
    * */
    onConnection(user: User) {
        if (!user) return;
        if (!user.online) {
            this.sendMessageToAllChatRooms(user.name + ' is now online', user.chatRooms);
            console.log(user.name + ' is now online');
        }
        user.online = true;
    }

    /*
    * Send a message to the chat rooms the user is part of saying it is disconnected.
    * */
    onDisconnect(user: User) {
        if (user.online) {
            this.sendMessageToAllChatRooms(user.name + ' is now offline', user.chatRooms);
            console.log(user.name + ' is now offline');
        }
        user.online = false;

    }

    /*
    * Iterate over an array of chat room sending them the message provided in the parameters.
    * */
    sendMessageToAllChatRooms(message: string, chatRooms: ChatRoom[]) {
        chatRooms.forEach(chat =>
            this.chatWebSocket.sendMessageToChat(chat, new this.Message(message, Message.MessageType.ServerMessage)));
    }

};