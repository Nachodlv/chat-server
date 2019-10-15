import User from '../../models/user.js';
import {ChatRoom} from "../../models/chat_room.js";

$(function () {
    //TODO agarrar el user id de las cookies
    const user: User = new User("nacho");
    user.id = 0;
    const chatRoom = new ChatRoom('123', 0);
    chatRoom.id = 0;
    user.chatRooms.push(chatRoom);
    // const socket: any = io({query: "userId=0"});
    // const userSocket: any = io('/' + user.id);
    const roomsSockets: Map<number, any> = user.chatRooms.map(room => {
        console.log(room);
        const roomSocket = io('/chat-room', {query: "roomId=" + room.id});
        return [room.id, roomSocket];
    });

});