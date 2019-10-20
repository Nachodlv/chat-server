import {ChatRoom} from "../../../models/chat_room.js";
import {addUser} from "../user-list/user_list.js";

/*
* Add the html from invite_user.html to the DOM where the function is called.
* */
export function addInviteUserInput(serverSocket, rooms: ChatRoom[]) {
    $.get("./chat/invite-user/invite_user.html", (data) => {
        $('#invite-user').html(data);
        $('#invite-user-form').submit(() => inviteUser(serverSocket, rooms));
        $('#invite-user-submit').on("click", () => inviteUser(serverSocket, rooms));
    });
}

/*
* Invite an user to the current room.
* If the invite is successful the user will be added to the user list.
* If the invite is unsuccessful, an error message will appear.
* */
function inviteUser(serverSocket, rooms: ChatRoom[]) {
    const input = $('#invite-user-input');
    const name: string = input.val();
    input.val('');
    const roomId: number = getCurrentRoomId();
    onError(false);
    serverSocket.emit('invite', {
        roomId: roomId,
        nickname: name
    }, (user: User, containsError: boolean, errorMessage: string) => {
        if (containsError) {
            onError(true, errorMessage);
            return;
        }
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
        room.users.push(user);
        const currentRoom = getCurrentRoomId();
        if (currentRoom === roomId) addUser(user);
    });
    return false;
}

/*
* Gets the current room id from the DOM.
* */
function getCurrentRoomId(): number {
    return Number($('#chat-group-id').text());
}

/*
* Shows or hides an error message.
* */
function onError(showError: boolean, error: string = '') {
    const errorMessage = $('#invite-user-error')[0];
    errorMessage.style['display'] = showError ? 'inherit' : 'none';
    errorMessage.innerHTML = error;
}