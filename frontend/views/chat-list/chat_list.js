import User from '../../models/user.js';
import {ChatRoom} from "../../models/chat_room.js";

$(function () {
    //TODO agarrar el user id de las cookies
    const user: User = new User("nacho");
    user.id = 0;
    const chatRoom = new ChatRoom('123', 0);
    chatRoom.id = 0;
    user.chatRooms.push(chatRoom);
    const socket: any = io('/', {query: "userId=0"});
    const roomSocket = io('/chat-room');
    // const userSocket: any = io('/' + user.id);
    const roomsSockets: Map<number, any> = user.chatRooms.map(room => {
        roomSocket.emit('join', room.id);
        return [room.id, roomSocket];
    });

});