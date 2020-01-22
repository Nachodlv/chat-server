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
import {IdService} from "../../services/id-service.js";


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
    const idService = new IdService();

    idService.getId((id) => {
        const serverSocket = io.connect('/', {query: "userId=" + user.id,  transports: [ 'websocket' ],  'reconnection': false});
        const chatSocket = io.connect('/chat-room', {
            transports: [ 'websocket' ],
            'reconnection': false
        });

        initChatRoomView(user, chatSocket, serverSocket, id);
    }, () => {console.log("Error getting the ip and the id")})

}

function tryReconnect(reconnectionCount, interval, user, chatSocket, serverSocket, id) {
    reconnectionCount.count ++;
    if (reconnectionCount.count >= 50) {
        clearInterval(interval);
    }
    $.ajax('/')
        .success(function () {
            chatSocket.open();
            serverSocket.open();
            clearInterval(interval);
            user.chatRooms.forEach(roomId => chatSocket.emit('join', roomId));
        }).error(function (err) {
        console.log("http request failed (probably server not up yet)");
    });
}

function initChatRoomView(user, chatSocket, serverSocket, id) {
    const reconnectionCount = {count: 0};

    let serverInterval;
    let chatInterval;
    // serverSocket.on('disconnect', function () {
    //     serverInterval = setInterval(() => tryReconnect(reconnectionCount, serverInterval, serverSocket, user, chatSocket, serverSocket, id), 10000);
    // });
    chatSocket.on('disconnect', function () {
        chatInterval = setInterval(() => tryReconnect(reconnectionCount, chatInterval, user, chatSocket, serverSocket, id), 5000);
    });
    chatSocket.on('id', (id) => {
        setInstanceId(id);
    });
    user.chatRooms.forEach(roomId => chatSocket.emit('join', roomId));

    groupListInit(chatSocket, serverSocket, user, (groups) => {
        chatInit(chatSocket, user, groups, serverSocket, id);
        addInviteUserInput(serverSocket, groups);
        addLogoutButton(serverSocket, chatSocket);
    });
}

function setInstanceId(id: string) {
    $('#instance-id')[0].innerHTML = `ID: ${id}`;
}

