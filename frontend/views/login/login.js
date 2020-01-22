/*
* File imported in the login.html.
* Adds functionality to the login view.
* */

import User from "../../models/user.js";
import {CookieService} from "../../services/cookie-service.js";
import {AuthService} from "../../services/auth-service.js";
import {IdService} from "../../services/id-service.js";

const idService = new IdService();

/*
* Function that executes when the file is imported in login.html
* Check if a user is logged in.
* */
$(function () {
    idService.getId((id) => {
        AuthService.isAuthorized(() => {
            window.location.href = '/';
        }, () => initLogin(id))
    })

});

function initLogin(id:string) {
    setId(id);
    onSubmit();
    onRegisterClick();
}

function setId(id: string) {
    $('#instance-id')[0].innerHTML = `ID: ${id}`;
}

/*
* Adds the functionality to the form of creating a new user when is submitted.
* */
function onSubmit(): void {
    const charactersNotValid = ['@', ',', ' '];
    $('form').submit(function () {
        const nickname: string = $('#nickname').val();
        if (nickname.match(new RegExp(`.*[${charactersNotValid.join()}]`))) {
            showError('Invalid characters');
            return false;
        }
        const pass: string = $('#password').val();
        if (pass.length < 6) {
            showError('Password should be at least 6 characters long');
            return false;
        }
        loginUser(nickname, pass);
        return false;
    });
}

function onRegisterClick() {
    $('.register-btn').on("click", () => {
        window.location.href = '/register';
    });
}

/*
* Make a post to '/login'. It attaches to the body an user with the nickname specified in the parameters of the
* function.
* If the post fails it will show an error in the html specifying the error.
* */
function loginUser(nickname, pass): void {
    $.ajax({
        type: "POST",
        beforeSend: function(request) {
            request.setRequestHeader("Content-Type", "application/json");
        },
        url: "/login",
        data: JSON.stringify(new User(nickname, pass)),
        processData: false,
        success: function(msg) {
            CookieService.setCookie('userId', JSON.parse(msg).id, 1);
            window.location.href = '/';
        },
        error: function (xhr) {
            if(xhr.status === 404 || xhr.status === 403) showError('Incorrect username or password.');
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
