/*
* Function that executes when the file is imported in index.html
* Check if the user is logged in
* */
import User from "../../models/user.js";
import {addChatList, onUserStatusChange} from "./user-list/user_list.js";
import {AuthService} from "../../services/auth-service.js";
import {groupListInit} from "./group-list/group_list.js";
import {chatInit} from "./chat.js";
import {addInviteUserInput} from "./invite-user/invite_user.js";

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
    const serverSocket = io('/', {query: "userId=" + user.id});
    const chatSocket = io('/chat-room');
    user.chatRooms.forEach(roomId => chatSocket.emit('join', roomId));
    groupListInit(chatSocket, serverSocket, user, (groups) => {
        chatInit(chatSocket, user, groups);
        addInviteUserInput(serverSocket, groups);
    });
}
