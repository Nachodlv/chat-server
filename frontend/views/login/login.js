/*
* File imported in the login.html.
* Adds functionality to the login view.
* */

import User from "../../models/user.js";
import {CookieService} from "../../services/cookie-service.js";
import {AuthService} from "../../services/auth-service.js";

/*
* Function that executes when the file is imported in login.html
* Check if a user is logged in.
* */
$(function () {
    AuthService.isAuthorized(() => {
        window.location.href = '/';
    }, onSubmit)
});


/*
* Adds the functionality to the form of creating a new user when is submitted.
* */
function onSubmit(): void {
    const charactersNotValid = ['@', ',', ' '];
    $('form').submit(function () {
        const input: string = $('#nickname').val();
        if (input.match(new RegExp(`.*[${charactersNotValid.join()}]`))) {
            showError('Invalid characters');
            return false;
        }
        createUser(input);
        return false;
    });
}

/*
* Make a post to '/login'. It attaches to the body an user with the nickname specified in the parameters of the
* function.
* If the post fails it will show an error in the html specifying the error.
* */
function createUser(nickname): void {
    $.ajax({
        type: "POST",
        beforeSend: function(request) {
            request.setRequestHeader("Content-Type", "application/json");
        },
        url: "/login",
        data: JSON.stringify(new User(nickname)),
        processData: false,
        success: function(msg) {
            CookieService.setCookie('user', msg, 1);
            window.location.href = '/';
        },
        error: function (xhr) {
            if(xhr.status === 409) showError('The username is already in use.');
            else showError('An error has occurred. Please try again later.');
        }
    });
}

/*
* Function that display an error message
* */
function showError(error: string) {
    const errorDiv = $('#error')[0];
   errorDiv.style['display'] = 'inherit';
   errorDiv.innerHTML = error;
}
