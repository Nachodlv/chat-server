/*
* Function that executes when the file is imported in index.html
* Check if the user is logged in
* */
import User from "../../models/user.js";
import {AuthService} from "../../services/auth-service.js";
import {groupListInit} from "./group-list/group_list.js";
import {chatInit} from "./chat.js";
import {addInviteUserInput} from "./invite-user/invite_user.js";
import {addLogoutButton} from "./logout-button/logout_button.js";

/*
* Function that is called when the file is imported.
* Checks if a user is logged in, if not it redirects them to the login page.
* */
$(function () {
    AuthService.isAuthorized(init, () => {
        window.location.href = '/login';
        return false
    });

});

/*
* Function called after user is authorized.
* It initializes the socket at a given namespace and room.
* It initializes the group list, and then the group chat and invite user input
* */
function init(user: User) {
    const serverSocket = io('/', {query: "userId=" + user.id, secure: true});
    const chatSocket = io('/chat-room', {secure: true});
    user.chatRooms.forEach(roomId => chatSocket.emit('join', roomId));
    groupListInit(chatSocket, serverSocket, user, (groups) => {
        chatInit(chatSocket, user, groups, serverSocket);
        addInviteUserInput(serverSocket, groups);
        addLogoutButton(serverSocket, chatSocket);
    });
}
