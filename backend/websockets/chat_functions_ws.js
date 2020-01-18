/*
* Web socket used to invite or kick users from groups.
* */
module.exports = class ChatFunctionWebSocket {
    userProvider: UserProvider;
    roomProvider: ChatRoomProvider;
    Message: Message;
    MessageType: MessageType;
    chatWs: ChatWebSocket;

    constructor(io, userProvider: UserProvider, roomProvider: ChatRoomProvider, Message: Message, chatWs: ChatWebSocket, MessageType: MessageType) {
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
            // this.onChatRoomKick(socket);
            // this.onDeleteChatRoom(socket);
        });
    }

    /*
    * When an invite to a group is sent it automatically adds the user invited to the chat.
    * The user who sends the invite is responded if the invitation was successful or it was a failure and the user
    * invited is notified.
    * If the invitation is successful a server message to the room is send.
    * */
    onChatRoomInvite(socket) {
        socket.on('invite', (data, fn: (user: User, containsError: boolean, errorMessage: string) => void) => {
            const room: ChatRoom = this.roomProvider.getModel(data.roomId);
            this.roomProvider.getChatRoomById(data.roomId, (room, error) => {
                if (!room) {
                    fn(undefined, true, 'The room does not exist');
                    return;
                }
                this.userProvider.getUser(data.nickname, (user, _) => {
                    if (user === undefined) {
                        fn(user, true, 'The user does not exists');
                        return;
                    }
                    if (room.users.find(u => u.id === user.id)) {
                        fn(user, true, 'The user is already in the chat room');
                        return;
                    }
                    room.users.push(user);

                    this.roomProvider.addUserToChatRoom(user.id, room.id, (error) => {
                        if (error) {
                            fn(user, true, error);
                            return;
                        }
                        user.chatRooms.push(room.id);
                        fn(user, false);
                        socket.to(user.id).emit('invite', room);
                        this.chatWs.sendMessageToChat(room.id, new this.Message(`${user.name} has joined the group!`,
                            user.name, this.MessageType.ServerMessage, room.id));
                        console.log(`${data.nickname} was invited to ${room.name}`)
                    })

                    /*this.userProvider.updateUser(user, (userUpdated, _) => {
                        fn(userUpdated, false);
                        socket.to(userUpdated.id).emit('invite', room);
                        this.chatWs.sendMessageToChat(room.id, new this.Message(`${userUpdated.name} has joined the group!`,
                            userUpdated.name, this.MessageType.ServerMessage, room.id));
                        console.log(`${data.nickname} was invited to ${room.name}`)
                    });*/

                });
            });
        })
    }

    /*
    * When someone kick an user from a group the function remove this user from the chat and notifies the user kicked.
    * */
    /*onChatRoomKick(socket) {
        socket.on('kick', (roomId: number, userId: number) => {
            this.userProvider.getUserById(userId, (user, _) => {
                const room: ChatRoom = this.roomProvider.getModel(roomId);
                if (user === undefined || !room) return;
                user.chatRooms = user.chatRooms.filter(id => id !== roomId);
                this.userProvider.updateUser(user, (updatedUser, _) => {
                    if (updatedUser === undefined) {
                        console.log("Error while trying to kick an user");
                        return;
                    }
                    room.users = room.users.filter(user => updatedUser.id !== userId);
                    socket.to(user.id).emit('kick', roomId);
                });
            });
        });
    }*/

    /*
    * When a chat room is deleted the function deletes the chat and notifies the members of the chat.
    * */
    /*onDeleteChatRoom(socket) {
        socket.on('delete', (roomId: number) => {
            const room: ChatRoom = this.roomProvider.getModel(roomId);
            if (!room) return;
            this.roomProvider.deleteModel(roomId);
            room.users.forEach(user => {
                user.chatRooms = user.chatRooms.filter(id => id !== roomId);
                this.userProvider.updateUser(user, (userUpdated, error) => {
                    if (userUpdated === null) {
                        console.log(error);
                        return;
                    }
                    socket.to(userUpdated.id).emit('delete', roomId);
                });
            });
        })
    }*/
};
