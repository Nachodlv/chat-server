import User from "../../models/user.js";
import {Message, MessageType, PrivateMessage} from "../../models/message.js";
import {ChatRoom} from "../../models/chat_room.js";
import {addChatList, onUserStatusChange} from "./user-list/user_list.js";

export function chatInit(socket, user, groups: ChatRoom[], serverSocket) {
    onMessageReceived(socket, user, groups);
    onServerMessage(socket, groups);
    onPrivateMessage(serverSocket, groups, user);
}

/*
* It initializes the socket at a given namespace and room.
* It initializes the form submit and message received listeners.
* */
export function onGroupSelected(socket, user, group: ChatRoom, serverSocket) {
    $('#invite-user')[0].hidden = false;
    addChatList(group.users);
    onSubmit(socket, user, group, serverSocket);
    populateHTML(user, group)
}

function populateHTML(user: User, group: ChatRoom) {
    $('#chat-group-name').text(group.name);
    $('#chat-group-id').text(group.id);
    $('#messages').empty().append('<li>' +
        '<div class="msg-container server">' +
        '<p>This is the beginning of the group chat history</p>' +
        '</div>' +
        '</li>');
    group.messages.forEach(msg => {
        const isAuthor = msg.userName === user.name;
        switch (msg.messageType) {
            case MessageType.UserMessage:
                appendUserMessage(msg, isAuthor);
                break;
            case MessageType.PrivateMessage:
                appendPrivateMessage(msg, isAuthor);
                break;
            default:
                appendServerMessage(msg);
        }
    })
}

/*
* Function that handles the form submission.
* It grabs the value entered by the user and emits it as a Message object.
* The Message object has some added information used to route and display the message.
* */
function onSubmit(socket, user, group, serverSocket) {
    $('#message-form').unbind('submit').bind('submit', () => {
        const input = $('#m');
        const message = new Message(input.val(), user.name, MessageType.UserMessage, new Date(), group.id);
        group.messages.push(message);
        input.val('');
        if (message.text[0] === '@') {
            sendPrivateMessage(message, serverSocket, group.id, user);
            return false;
        }
        appendUserMessage(message, true);
        socket.emit('chat message', JSON.stringify(message));
        return false;
    });
}

/*
* Listener that is called when a user message is sent to this specific roomId and namespace.
* */
function onMessageReceived(socket, user, groups: ChatRoom[]) {
    socket.on('chat message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        groups.find(group => group.id === msg.roomId).messages.push(msg);
        console.log(getCurrentRoomId());
        if (getCurrentRoomId() === msg.roomId) appendUserMessage(msg, msg.userName === user.name);
    });
}

/*
* It appends a <li> to the html containing the user message.
* The way the message is presented changes according to the author of the message.
* */
function appendUserMessage(msg: Message, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = $(isAuthor ? '<div class="msg-container author">' : '<div class="msg-container">');
            if (!isAuthor) node.append($('<p class="author-name">').text(msg.userName));
            node.append($('<p>').text(msg.text))
                .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
            return node;
        }));
    window.scrollTo(0, document.body.scrollHeight);
}

/*
* Listener that is called when a server message is sent to this specific roomId and namespace.
* */
function onServerMessage(socket, groups: ChatRoom[]) {
    socket.on('server message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        const group: ChatRoom = groups.find(group => group.id === msg.roomId);
        if (group) group.messages.push(msg);
        if (msg.messageType === MessageType.OnlineMessage) {
            onUserStatusChange(msg.userName, true);
        } else if (msg.messageType === MessageType.OfflineMessage) {
            onUserStatusChange(msg.userName, false);
        }
        if (getCurrentRoomId() === msg.roomId) appendServerMessage(msg);
    });
}

/*
* It appends a <li> to the html containing the server message.
* */
function appendServerMessage(msg: Message) {
    $('#messages').append($('<li>').append($('<div class="msg-container server">')
        .append($('<p>').text(`${msg.text} (${new Date(msg.timeStamp).toLocaleTimeString('it-IT')})`))));
    window.scrollTo(0, document.body.scrollHeight);
}

function sendPrivateMessage(message: Message, serverSocket, groupId: number, user: User) {

    const onError = (error) => appendServerMessage(new Message(error, '', MessageType.PrivateMessage, new Date(), groupId));
    let names: string[] = message.text.slice(1).split(new RegExp(", |,"));
    if (names.length === 0) {
        onError('@ needs to be followed by the usernames separated by ","');
        return;
    }
    const lastNameWithText = names[names.length - 1];
    const index = lastNameWithText.indexOf(' ');
    names[names.length - 1] = lastNameWithText.substr(0, index);
    names = names.filter(name => user.name !== name);
    const text: string = lastNameWithText.substr(index);
    if (!text) {
        onError('Please add a message to the private message');
        return;
    }
    const privateMessage: PrivateMessage = new PrivateMessage(names, text, message.userName,
        MessageType.PrivateMessage, message.timeStamp, message.roomId);
    appendPrivateMessage(privateMessage, true);
    serverSocket.emit('private message', privateMessage, (error: string) => {
        onError(error);
    })
}

function onPrivateMessage(serverSocket, groups: ChatRoom[], user: User) {
    serverSocket.on('private message', (message: Message) => {
        const group = groups.find(group => group.id === message.roomId);
        group.messages.push(message);
        if (getCurrentRoomId() === message.roomId) appendPrivateMessage(message, user.name === message.userName);
    });
}

function appendPrivateMessage(msg: PrivateMessage, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = isAuthor ? '<div class="msg-container private-message author">' : '<div class="msg-container private-message">';
            node.append(`
                <div class="row">
                    ${!isAuthor ? `<p class="author-name private-message">${msg.userName}</p>` : ''}
                    ${msg.nicknames.length > 1 ? `<div class="dropdown ${isAuthor ? 'dropleft' : ''}">
                        <div class="dropdown-toggle" id="dropdownMenu2"
                             data-toggle="dropdown"
                             aria-haspopup="true" aria-expanded="false">
                        </div>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenu2" id="user-list">
                            ${msg.nicknames.map(nickname => `<div class="dropdown-item">${nickname}</div>`).join()}
                       </div>
                   </div>` : ''}
                </div>`);
            node.append($('<p>').text(msg.text))
                .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
            return node;
        }));
    window.scrollTo(0, document.body.scrollHeight);
}

/*
* Gets the current room id from the DOM.
* */
export function getCurrentRoomId(): number {
    const id: string = $('#chat-group-id').text();
    return id ? Number(id) : undefined;
}
