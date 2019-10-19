/*
* Function that executes when the file is imported in index.html
* Check if the user is logged in
* */
import User from "../../models/user.js";
import {addChatList, onUserStatusChange} from "./chat-list/chat_list.js";
import {AuthService} from "../../services/auth-service.js";
import {groupListInit} from "./group-list/group_list.js";
import {chatInit} from "./chat.js";

$(function () {
    const user = new User("jorge");
    addChatList([user]);
    setTimeout(() => {
        user.online = true;
        onUserStatusChange(user);
    }, 10000);
    AuthService.isAuthorized(init, () => {
        window.location.href = '/login';
        return false
    });

});

/*
* Gets chat rooms for logged user
* */
function init(user: User) {
    const socket = io('/chat-room', {query: "userId=" + user.id});
    user.chatRooms.forEach(roomId => socket.emit('join', roomId));
    groupListInit(socket, user);
    chatInit(socket, user);
}
