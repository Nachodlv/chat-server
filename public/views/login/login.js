
console.log('hello');

$(function () {
    console.log('hello');
    $('form').submit(function () {
        const input = $('#nickname').val();
        createUser(input);
        return false;
    });
});

function createUser(nickname) {
    $.ajax({
        type: "POST",
        beforeSend: function(request) {
            request.setRequestHeader("Content-Type", "application/json");
        },
        url: "/login",
        data: JSON.stringify({nickname: nickname}),
        processData: false,
        success: function(msg) {
            this.$router.push('/login');
        }
    });
}