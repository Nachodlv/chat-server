/*
* Web socket used to invite or kick users from groups.
* */
module.exports = class ChatFunctionWebSocket {
    userProvider: Provider;
    roomProvider: Provider;
    Message: Message;
    MessageType: MessageType;
    chatWs: ChatWebSocket;

    constructor(io, userProvider: Provider, roomProvider: Provider, Message: Message, chatWs: ChatWebSocket, MessageType: MessageType) {
        this.userProvider = userProvider;
        this.roomProvider = roomProvider;
        this.chatWs = chatWs;
        this.Message = Message;
        this.MessageType = MessageType;
        this.namespace = io.of('/');
        this.assignCallbacks();
    }

    /*
    * Assign callbacks for the invite and kick from a group
    * */
    assignCallbacks() {
        this.namespace.on('connection', (socket) => {
            this.onChatRoomInvite(socket);
            this.onChatRoomKick(socket);
            this.onDeleteChatRoom(socket);
        });
    }

    /*
    * When an invite to a group is sent it automatically adds the user invited to the chat.
    * The user who sends the invite is responded if the invitation was successful or it was a failure and the user
    * invited is notified.
    * */
    onChatRoomInvite(socket) {
        socket.on('invite', (data, fn: (user: User, containsError: boolean, errorMessage: string) => void) => {
            const room: ChatRoom = this.roomProvider.getModel(data.roomId);
            if (!room) {
                fn(undefined, true, 'An error occurred');
                return;
            }
            const user: User = this.userProvider.models.find((model) => model.name === data.nickname);
            if (!user) {
                fn(user, true, 'The user does not exists');
                return;
            }
            if (room.users.find(u => u.id === user.id)) {
                fn(user, true, 'The user is already in the chat room');
                return;
            }
            room.users.push(user);
            user.chatRooms.push(room.id);
            fn(user, false);
            socket.to(user.id).emit('invite', room);
            this.chatWs.sendMessageToChat(room.id, new this.Message(`${user.name} has joined the group!`,
                user.name, this.MessageType.ServerMessage, room.id));
            console.log(`${data.nickname} was invited to ${room.name}`)
        })
    }

    /*
    * When someone kick an user from a group the function remove this user from the chat and notifies the user kicked.
    * */
    onChatRoomKick(socket) {
        socket.on('kick', (roomId: number, userId: number) => {
            const user: User = this.userProvider.getModel(userId);
            const room: ChatRoom = this.roomProvider.getModel(roomId);
            if (!user || !room) return;
            user.chatRooms = user.chatRooms.filter(id => id !== roomId);
            room.users = room.users.filter(user => user.id !== userId);
            socket.to(user.id).emit('kick', roomId);
        });
    }

    /*
    * When a chat room is deleted the function deletes the chat and notifies the members of the chat.
    * */
    onDeleteChatRoom(socket) {
        socket.on('delete', (roomId: number) => {
            const room: ChatRoom = this.roomProvider.getModel(roomId);
            if (!room) return;
            this.roomProvider.deleteModel(roomId);
            room.users.forEach(user => {
                user.chatRooms = user.chatRooms.filter(id => id !== roomId);
                socket.to(user.id).emit('delete', roomId);
            });
        })
    }
};
