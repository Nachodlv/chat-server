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
    initRegister()
});

function initRegister() {
    idService.getId((id) => {
        AuthService.isAuthorized(() => {
            window.location.href = '/';
        }, () => {
            setId(id);
            onSubmit();
            onImageSelect();
            onLoginClick();
        });

    }, (error) => console.log(error));
}

function setId(id: string):void {
    $('#instance_id')[0].innerHTML = `ID: ${id}`;
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
        const file = $('input[type="file"]')[0].files[0];
        registerUser(nickname, pass, file);
        // saveImage(file, nickname, pass);
        return false;
    });
}

function onImageSelect() {
    $('#image-browse').on("click", () => {
        $('#file-input').click();
    });
    $('input[type="file"]').change((e) => {
        const file = e.target.files[0];
        $("#file-text").val(file.name);

        const reader = new FileReader();
        reader.onload = function(e) {
            // get loaded data and render thumbnail.
            document.getElementById("preview").src = e.target.result;
        };
        // read the image file as a data URL.
        reader.readAsDataURL(file);
    });
}

function onLoginClick() {
    $('.login-btn').on("click", () => {
        window.location.href = '/login';
    });
}
function registerUser(nickname, pass, file): void {
    const formData = new FormData();
    formData.append('imageFile', file);
    formData.append('user', JSON.stringify(new User(nickname, pass)));
    $.ajax({
        type: "POST",
        url: "/register",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(msg) {
            CookieService.setCookie("userId", JSON.parse(msg).id, 1);
            window.location.href = '/';
        },
        error: function (xhr) {
            if(xhr.status === 409) showError('The username is already in use.');
            else if(xhr.status === 403) showError(xhr.responseText);
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
