/*
* Web socket to check if an user is online or offline.
* */

module.exports = class OnlineWebSocket {
    userProvider: UserProvider;
    Message: Message;
    MessageType: MessageType;

    constructor(io, userProvider: UserProvider, Message: Message, MessageType: MessageType, chatWs: ChatWebSocket) {
        this.userProvider = userProvider;
        this.Message = Message;
        this.MessageType = MessageType;
        this.namespace = io.of('/');
        this.chatWs = chatWs;
        this.assignCallbacks();
    }

    /*
    * Assign callback for the connection and disconnection of the users in the default socket.
    * Retrieves the user id in the socket handshake provided by the client connecting.
    * If the user does not exists the callback is ended.
    * */
    assignCallbacks() {
        this.namespace.on('connection', (socket) => {
            const userId: number = Number(socket.handshake.query['userId']);
            this.userProvider.getUserById(userId, (user, _) => {
                socket.join(String(userId));
                if (user === undefined) return;
                this.onConnection(user);
                socket.on('disconnect', () => this.onDisconnect(user));
            });

        });
    }

    /*
    * Send a message to the chat rooms the user is part of saying it is connected.
    * */
    onConnection(user: User) {
        if (!user) return;
        if (!user.online) {
            this.sendMessageToAllChatRooms(user.name + ' is now online', user.chatRooms, user.name, true);
            console.log(user.name + ' is now online');
        }
        user.online = true;
        this.userProvider.updateUser(user);
    }

    /*
    * Send a message to the chat rooms the user is part of saying it is disconnected.
    * */
    onDisconnect(user: User) {
        if (user.online) {
            this.sendMessageToAllChatRooms(user.name + ' is now offline', user.chatRooms, user.name, false);
            console.log(user.name + ' is now offline');
        }
        user.online = false;
        this.userProvider.updateUser(user);
    }

    /*
    * Iterate over an array of chat room sending them the message provided in the parameters.
    * */
    sendMessageToAllChatRooms(message: string, chatRooms: number[], nickname: string, online: boolean) {
        chatRooms.forEach(chatId =>
            this.chatWs.sendMessageToChat(chatId, new this.Message(message, nickname,
                online ? this.MessageType.OnlineMessage : this.MessageType.OfflineMessage,
                chatId)));
    }


};
