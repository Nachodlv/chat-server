import {ChatRoom} from "../../../models/chat_room.js";
import User from "../../../models/user.js";
import {FileMessage} from "../../../models/message.js";
import {onGroupSelected} from "../chat.js";

/*
* Gets the ChatRooms a user is part of.
* */
export function groupListInit(chatSocket, serverSocket, user, onGroupListReady: (ChatRoom[]) => void) {
    let groups = [];
    if (!user.chatRooms.length) {
        onGroupListReady(groups);
        addGroupList(chatSocket, user, groups, serverSocket);
        listenToInvites(serverSocket, chatSocket, user, groups);
        onNewGroupFormSubmit(chatSocket, user, groups, serverSocket);
        return;
    }
    const query = user.chatRooms.length ? user.chatRooms.reduce((prev, curr) => prev + `ids=${curr}&`, '?') : '?';
    $.get('/chat-rooms' + query.slice(0, query.length - 1), (data) => {
            groups = JSON.parse(data);
            onGroupListReady(groups);
            addGroupList(chatSocket, user, groups, serverSocket);
            listenToInvites(serverSocket, chatSocket, user, groups);
            onNewGroupFormSubmit(chatSocket, user, groups, serverSocket);
        }
    );
}

/*
* Add the html from group_list.html to the DOM where the function is called.
* */
function addGroupList(socket, user: User, groups: ChatRoom[], serverSocket) {
    $.get("./chat/group-list/group_list.html", (data) => {
        $('#group-list').html(data);
        groups.forEach(group => addGroup(socket, user, group, serverSocket));
    });
}

/*
* Add the user specified in the parameters to the list of users.
* */
function addGroup(socket, user: User, group: ChatRoom, serverSocket) {
    const lastMsg: FileMessage = group.messages[group.messages.length - 1];
    $('#group-list').append(`
        <li id="li-${group.id}" class="list-group-item list-group-item-primary clickable">
            <div class="group-info">
                <p>${group.name}</p>
                ${lastMsg ? `<p class="last-message">${lastMsg.userName}: ${lastMsg.text ? lastMsg.text : lastMsg.fileName}</p>` : ''}
             </div>
            <i class="material-icons align-self-center">arrow_forward_ios</i>
        </li>
    `);
    const node = $(`#li-${group.id}`);
    node.on("click", () => {
        $('.active-group').removeClass('active-group');
        node.addClass('active-group');
        onGroupSelected(socket, user, group, serverSocket)
    });
}

/*
* Make a post to '/chat-room'. It attaches to the body a room with the name specified in the parameters of the
* function.
* If the post fails it will show an error in the html specifying the error.
* */
function onNewGroupFormSubmit(socket, user: User, rooms: ChatRoom[], serverSocket) {
    $('#new-group-form').submit(() => processSubmit(socket, user, rooms, serverSocket));
    $('#new-group-submit').on("click", () => processSubmit(socket, user, rooms, serverSocket));
}

function processSubmit(socket, user: User, rooms: ChatRoom[], serverSocket) {
    const input = $('#g');
    if (!input.val()) {
        alert('Invalid new group name');
        return false;
    }
    const newRoom = new ChatRoom(input.val(), user.id);
    $.ajax({
        type: "POST",
        beforeSend: (request) => {
            request.setRequestHeader("Content-Type", "application/json");
        },
        url: "/chat-room",
        data: JSON.stringify(newRoom),
        processData: false,
        success: (msg) => {
            const group: ChatRoom = JSON.parse(msg);
            rooms.push(group);
            socket.emit("join", group.id);
            addGroup(socket, user, group, serverSocket);
            input.val('');
            return false;
        },
        error: function (xhr) {
            alert(xhr.message);
            return false;
        }
    });
    return false;
}

function listenToInvites(serverSocket, chatSocket, user: User, groups: ChatRoom[]) {
    serverSocket.on('invite', (room: ChatRoom) => {
        chatSocket.emit('join', room.id);
        groups.push(room);
        user.chatRooms.push(room.id);
        addGroup(chatSocket, user, room, serverSocket);
    });
}
