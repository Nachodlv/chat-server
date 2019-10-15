import {CookieService} from "../../services/cookie-service.js";
import User from "../../models/user.js";
import {Message} from "../../models/message.js";

$(function () {
    const socket = io('/chat-room');
    const roomId = 1;
    socket.emit('join', roomId, socket);
    const user: User = JSON.parse(CookieService.getCookie('user'));
    $('form').submit(function(){
        const input = $('#m');
        // socket.emit('chat message', input.val());
        socket.emit('chat message', JSON.stringify(new Message(input.val(), user.name, Message.MessageType.UserMessage, new Date(), roomId)));
        input.val('');
        return false;
    });
    socket.on('chat message', function(msgStr){
        const msg: Message = JSON.parse(msgStr);
        $('#messages').append($('<li>').append($('<div>')
                .append($('<p>').text(`${msg.userName}: ${msg}`))
                .append($('<p class="time">').text(new Date().toLocaleTimeString('it-IT')))));
        window.scrollTo(0, document.body.scrollHeight);
    });
});
