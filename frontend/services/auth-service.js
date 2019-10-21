import {CookieService} from "./cookie-service.js";
import User from "../models/user.js";

export class AuthService {
    static isAuthorized(onSuccess: (User) => void, onFailure: () => void): void {
        const cookie = CookieService.getCookie('user');
        if (cookie === '') {
            this._failToAuthorize(onFailure);
            return;
        }
        const user = JSON.parse(cookie);
        if(user.id === undefined) {
            this._failToAuthorize(onFailure);
            return;
        }
        $.ajax({
            type: "GET",
            beforeSend: (request) => {
                request.setRequestHeader("Content-Type", "application/json");
            },
            url: "/user/" + user.id,
            processData: false,
            success: (msg) => {
                onSuccess(JSON.parse(msg));
            },
            error: () => {
                this._failToAuthorize(onFailure);
            }
        });
    }

    static _failToAuthorize(onFailure: () => void) {
        window.document.cookie = '';
        onFailure();
    }

}