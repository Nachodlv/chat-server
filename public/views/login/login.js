/*
* File imported in the login.html.
* Adds functionality to the login view.
* */

import User from "../../models/user.js";

/*
* Function that executes when the file is imported in login.html
* */
$(function () {
    onSubmit();
});


/*
* Adds the functionality to the form of creating a new user when is submitted.
* */
function onSubmit() {
    $('form').submit(function () {
        const input = $('#nickname').val();
        createUser(input);
        return false;
    });
}

/*
* Make a post to '/login'. It attaches to the body an user with the nickname specified in the parameters of the
* function.
* If the post fails it will show an error in the html specifying the error.
* */
function createUser(nickname) {
    $.ajax({
        type: "POST",
        beforeSend: function(request) {
            request.setRequestHeader("Content-Type", "application/json");
        },
        url: "/login",
        data: JSON.stringify(new User(nickname)),
        processData: false,
        success: function(msg) {
            const user = {user: msg};
            document.cookie = JSON.stringify(user);
            window.location.href = '/' ;
        },
        error: function (xhr) {
            if(xhr.status === 409) $('#nickname-repeated')[0].style['display'] = 'inherit';
            else $('#error')[0].style['display'] = 'inherit';
        }
    });
}