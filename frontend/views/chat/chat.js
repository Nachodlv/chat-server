import User from "../../models/user.js";
import {Message} from "../../models/message.js";
import {MessageType} from "../../models/message.js";
import {ChatRoom} from "../../models/chat_room.js";

export function chatInit(socket, user, groups: ChatRoom[]) {
    onMessageReceived(socket, user);
    onServerMessage(socket, groups);
}

/*
* It initializes the socket at a given namespace and room.
* It initializes the form submit and message received listeners.
* */
export function onGroupSelected(socket, user, group) {
    $('#invite-user')[0].hidden = false;
    onSubmit(socket, user, group);
    populateHTML(user, group)
}

function populateHTML(user: User, group: ChatRoom){
    $('#chat-group-name').text(group.name);
    $('#chat-group-id').text(group.id);
    $('#messages').empty().append('<li>' +
        '<div class="msg-container server">' +
        '<p>This is the beginning of the group chat history</p>' +
        '</div>' +
        '</li>');
    group.messages.forEach(msg => {
        if (msg.messageType === MessageType.UserMessage) appendUserMessage(msg, msg.userName === user.name);
        else appendServerMessage(msg) // will be file type message in the future
        // TODO check for other types ?
    })
}

/*
* Function that handles the form submission.
* It grabs the value entered by the user and emits it as a Message object.
* The Message object has some added information used to route and display the message.
* */
function onSubmit(socket, user, group) {
    $('#message-form').unbind('submit').bind('submit', () => {
        const input = $('#m');
        // socket.emit('chat message', input.val());
        const message = new Message(input.val(), user.name, MessageType.UserMessage, new Date(), group.id);
        group.messages.push(message);
        appendUserMessage(message, true);
        socket.emit('chat message', JSON.stringify(message));
        input.val('');
        return false;
    });
}

/*
* Listener that is called when a user message is sent to this specific roomId and namespace.
* */
function onMessageReceived(socket, user) {
    socket.on('chat message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        appendUserMessage(msg, msg.userName === user.name);
    });
}

/*
* It appends a <li> to the html containing the user message.
* The way the message is presented changes according to the author of the message.
* */
function appendUserMessage(msg: Message, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append( () => {
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
        if(group) group.messages.push(msg);
        if(Number($('#chat-group-id').text()) === msg.roomId) appendServerMessage(msg);
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
