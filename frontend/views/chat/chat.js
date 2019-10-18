import {AuthService} from "../../services/auth-service.js";
import User from "../../models/user.js";
import {Message} from "../../models/message.js";
import {MessageType} from "../../models/message.js";
import {addChatList, onUserStatusChange} from "./chat-list/chat_list.js";

/*
* Function that executes when the file is imported in index.html
* Check if the user is logged in
* */
$(function () {
    const user = new User("jorge");
    addChatList([user]);
    setTimeout(() => {
        user.online = true;
        onUserStatusChange(user);
    }, 10000);
    AuthService.isAuthorized(initializeSockets, () => {
        window.location.href = '/login';
        return false
    });

});

/*
* It initializes the socket at a given namespace and room.
* It initializes the form submit and message received listeners.
* */
function initializeSockets(user: User) {
    io('/', {query: "userId=" + user.id});
    const socket = io('/chat-room');
    const roomId = 0;
    socket.emit('join', roomId);
    onSubmit(socket, user, roomId);
    onMessageReceived(socket, user);
    onServerMessage(socket);
}

/*
* Function that handles the form submission.
* It grabs the value entered by the user and emits it as a Message object.
* The Message object has some added information used to route and display the message.
* */
function onSubmit(socket, user, roomId) {
    $('form').submit(() => {
        const input = $('#m');
        // socket.emit('chat message', input.val());
        const message = new Message(input.val(), user.name, MessageType.UserMessage, new Date(), roomId);
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
function onServerMessage(socket) {
    socket.on('server message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        appendServerMessage(msg);
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

// TODO get All previous messages upon joining, How do I access provider ???
