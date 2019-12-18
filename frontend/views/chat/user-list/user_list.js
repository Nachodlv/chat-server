/*
* Add the html from user_list.html to the DOM where the function is called.
* */
export function addChatList(users: User[] = []) {

    $.get("./chat/user-list/user_list.html", (data) => {
        $('#chat-list').html(data);
        users.forEach(addUser);
    });
}

/*
* Add the user specified in the parameters to the list of users.
* */
export function addUser(user: User) {
    $('#user-list').append(`
        <div class="dropdown-item" id="${user.name}">
            <div rel='tooltip' data-original-title='${getUserImage(user)}'>
                <div class="row justify-content-between">
                    <div class="user-name">
                        ${user.name}
                    </div>
                    <i class="${getIconClass(user.online)}">brightness_1</i>
                </div>
            </div>
        </div>
    `);
    $(function () {
        $("[rel='tooltip']").tooltip({html: true});
    });
}

/*
* Changes the color of the icon next to the user name depending if it is online or offline.
* */
export function onUserStatusChange(userName: string, online: boolean) {
    $(`#${userName} .user-status`)[0].className = getIconClass(online);
}

/*
* Returns the class name of the icon depending on the status specified on the parameters.
* */
function getIconClass(status: boolean): string {
    return `material-icons online-icon ${status ? 'online' : 'offline'} user-status`;
}

function getImageId(imgPath: string): string {
    return imgPath.substring(0, imgPath.length - 1).replace(/\//g, "%2F");
}

function getUserImage(user: User): string {
    return `<img height="60" data-placement="left" src="${window.location.href}image/${getImageId(user.imgPath)}">`;
}

