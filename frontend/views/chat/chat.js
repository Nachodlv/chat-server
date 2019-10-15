import {CookieService} from "../../services/cookie-service.js";
import User from "../../models/user.js";
import {Message} from "../../models/message.js";
import {MessageType} from "../../models/message.js";

/*
* Function that executes when the file is imported in index.html
* It initializes the socket at a given namespace and room.
* It initializes the form submit and message received listeners.
* */
$(function () {
    const socket = io('/chat-room');
    const roomId = 1;
    socket.emit('join', roomId);
    const cookie = CookieService.getCookie('user');
    if (cookie === '') {
        window.location.href = '/login';
        return false
    }
    const user: User = JSON.parse(cookie);
    onSubmit(socket, user, roomId);
    onMessageReceived(socket, user);
});

/*
* Function that handles the form submission.
* It grabs the value entered by the user and emits it as a Message object.
* The Message object has some added information used to route and display the message.
* */
function onSubmit(socket, user, roomId) {
    $('form').submit(function(){
        const input = $('#m');
        // socket.emit('chat message', input.val());
        socket.emit('chat message', JSON.stringify(new Message(input.val(), user.name, MessageType.UserMessage,
            new Date(), roomId)));
        input.val('');
        return false;
    });
}

/*
* Listener that is called when a message is sent to this specific roomId and namespace.
* It appends a <li> to the html containing the message.
* The way the message is presented changes according to the MessageType and the author of the message.
* */
function onMessageReceived(socket, user) {
    socket.on('chat message', function(msgStr){
        const msg: Message = JSON.parse(msgStr);
        if (msg.messageType === MessageType.ServerMessage) {
            $('#messages').append($('<li>').append($('<div class="msg-container server">')
                .append($('<p>').text(`${msg.text} (${new Date(msg.timeStamp).toLocaleTimeString('it-IT')})`))));
        } else if(msg.messageType === MessageType.UserMessage) {
            const isAuthor = msg.userName === user.name;
            $('#messages').append($('<li>')
                .append( () => {
                    const node = $(isAuthor ? '<div class="msg-container author">' : '<div class="msg-container">');
                    if (!isAuthor) node.append($('<p class="author-name">').text(msg.userName));
                    node.append($('<p>').text(msg.text))
                        .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
                    return node;
                }));
        }
        window.scrollTo(0, document.body.scrollHeight);
    });
}

// TODO get All previous messages upon joining, How do I access provider ???
