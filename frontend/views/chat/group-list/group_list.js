import {ChatRoom} from "../../../models/chat_room.js";
import User from "../../../models/user.js";
import {Message} from "../../../models/message.js";
import {onGroupSelected} from "../chat.js";

export function groupListInit(socket, user){
    onNewGroupFormSubmit(socket, user);
    getGroupsForUser(socket, user)
}

/*
* Gets the ChatRooms a user is part of.
* */
function getGroupsForUser(socket, user: User) {
    const query = user.chatRooms.reduce((prev, curr) => prev + `ids=${curr}&`, '?');
    $.get('/chat-rooms'+query.slice(0,query.length-1), (data) =>
        addGroupList(socket, user, JSON.parse(data)) // TODO check if it parses users correctly
    );
}

/*
* Add the html from group_list.html to the DOM where the function is called.
* */
function addGroupList(socket, user: User, groups: ChatRoom[]) {
    $.get("./chat/group-list/group_list.html", (data) => {
        $('#group-list').html(data);

        groups.forEach(group => addGroup(socket, user, group));
    });
}

/*
* Add the user specified in the parameters to the list of users.
* */
function addGroup(socket, user: User, group: ChatRoom) {
    const lastMsg: Message = group.messages[group.messages.length-1];
    $('#group-list').append(`
        <li id="li-${group.id}" class="list-group-item list-group-item-primary clickable">
            <p>${group.name}</p>
            ${lastMsg ? `<p class="last-message">${lastMsg.userName}: ${lastMsg.text}</p>` : ''}
        </li>
    `);
    $(`#li-${group.id}`).on( "click", () => onGroupSelected(socket, user, group));
}

/*
* Make a post to '/chat-room'. It attaches to the body a room with the name specified in the parameters of the
* function.
* If the post fails it will show an error in the html specifying the error.
* */
function onNewGroupFormSubmit(socket, user: User) {
    $('#new-group-form').submit(() => processSubmit(socket, user));
    $('#new-group-submit').on( "click", () => processSubmit(socket, user));
}

function processSubmit(socket, user: User) {
    const input = $('#g');
    if(!input.val()){
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
            socket.emit("join", group.id);
            addGroup(socket, user, group);
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
