import {CookieService} from "./cookie-service.js";
import User from "../models/user.js";

/*
* Service used to handle user authorization.
* It checks the cookies to see if a user is logged in or not.
* */
export class AuthService {
    static isAuthorized(onSuccess: (User) => void, onFailure: () => void): void {
        const cookie = CookieService.getCookie('userId');
        if (cookie === '') {
            this._failToAuthorize(onFailure);
            return;
        }
        const id = Number(cookie);
        $.ajax({
            type: "GET",
            beforeSend: (request) => {
                request.setRequestHeader("Content-Type", "application/json");
            },
            url: "/user/" + id,
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
        CookieService.removeCookie('userId');
        onFailure();
    }

}
