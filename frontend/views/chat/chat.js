import {CookieService} from "../../services/cookie-service.js";
import User from "../../models/user.js";

$(function () {
    const socket = io();
    $('form').submit(function(){
        const input = $('#m');
        socket.emit('chat message', input.val());
        input.val('');
        return false;
    });
    socket.on('chat message', function(msg){
        const user: User = JSON.parse(CookieService.getCookie('user'));
        $('#messages').append($('<li>').append($('<div>')
                .append($('<p>').text(`${user.name}: ${msg}`))
                .append($('<p class="time">').text(new Date().toLocaleTimeString('it-IT')))));
        window.scrollTo(0, document.body.scrollHeight);
    });
});
