/*
* Add the html from logout_button to the DOM where the function is called.
* */
import {CookieService} from "../../../services/cookie-service.js";

export function addLogoutButton(serverSocket, chatSocket) {
    $.get("./chat/logout-button/logout_button.html", (data) => {
        $('#logout-button-container').html(data);
        $('#logout-button').on('click', () => logout(serverSocket, chatSocket));
    });
}

function logout(serverSocket, chatSocket) {
    CookieService.removeCookie('userId');
    serverSocket.disconnect(true);
    chatSocket.disconnect(true);
    window.location.href = '/login';
}
