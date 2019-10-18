import {ChatRoom} from "../../../models/chat_room.js";
import User from "../../../models/user.js";
import {Message} from "../../../models/message.js";
import {onGroupSelected} from "../chat.js";

/*
* Gets the ChatRooms a user is part of.
* */
export function getGroupsForUser(user: User) {
    const query = user.chatRooms.reduce((prev, curr) => prev + `ids=${curr}&`, '?');
    $.get('/chat-rooms'+query.slice(0,query.length-1), (data) =>
        addGroupList(JSON.parse(data)) // TODO check if it parses users correctly
    );
}

/*
* Add the html from group_list.html to the DOM where the function is called.
* */
function addGroupList(groups: ChatRoom[]) {
    $.get("./chat/group-list/group_list.html", (data) => {
        $('#group-list').html(data);

        groups.forEach(group => addGroup(group));
    });
}

/*
* Add the user specified in the parameters to the list of users.
* */
function addGroup(group: ChatRoom) {
    const lastMsg: Message = group.messages[group.messages.length-1];
    $('#group-list').append(`
        <li id="li-${group.id}" class="list-group-item list-group-item-primary clickable">
            <p>${group.name}</p>
            ${lastMsg ? `<p class="last-message">${lastMsg.userName}: ${lastMsg.text}</p>` : ''}
        </li>
    `);
    $(`#li-${group.id}`).on( "click", onGroupSelected(group));
}

function onGroupAdded() {
    
}

