import {ChatRoom} from "../../frontend/models/chat_room";
/*
* Web socket used to invite or kick users from groups.
* */
module.exports = class ChatFunctionWebSocket {
    userProvider: Provider;
    roomProvider: Provider;

    constructor(io, userProvider: Provider, roomProvider: Provider) {
        this.userProvider = userProvider;
        this.roomProvider = roomProvider;
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
        socket.on('invite', (roomId: number, nickname: string, onSuccess: (User) => void, onFailure: (string) => void) => {
            const room: ChatRoom = this.roomProvider.getModel(roomId);
            if (!room) {
                onFailure('An error occurred');
                return;
            }
            const user: User = this.userProvider.models.find((model) => model.name === nickname);
            if (!user) {
                onFailure('The user does not exists');
                return;
            }
            room.users.push(user);
            user.chatRooms.push(room.id);
            onSuccess(user);
            socket.to(user.id).emit('invite', room);
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