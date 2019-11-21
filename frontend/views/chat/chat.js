import User from "../../models/user.js";
import {Message, MessageType, PrivateMessage, FileMessage, PrivateFileMessage} from "../../models/message.js";
import {ChatRoom} from "../../models/chat_room.js";
import {addChatList, onUserStatusChange} from "./user-list/user_list.js";

/*
* Function that initializes the message received listeners.
* */
export function chatInit(socket, user, groups: ChatRoom[], serverSocket) {
    onMessageReceived(socket, user, groups);
    onFileMessageReceived(socket, user, groups);
    onServerMessage(socket, groups);
    onPrivateMessage(serverSocket, groups, user);
    onPrivateFileMessage(serverSocket, groups, user);
}

/*
* Function that initializes the form submit and file chosen listeners.
* */
export function onGroupSelected(socket, user, group: ChatRoom, serverSocket) {
    addChatList(group.users);
    onSubmit(socket, user, group, serverSocket);
    onFileChosen();
    populateHTML(user, group);
    showUserInvite();
    showMessageBar();
}

/*
* Function that adds the information of a group to the HTML.
* It adds the id, the name and the messages of the group.
* The format of the message depends on its type.
* */
function populateHTML(user: User, group: ChatRoom) {
    $('#chat-group-name').text(group.name);
    $('#chat-group-id').text(group.id);
    $('#messages').empty().append('<li>' +
        '<div class="msg-container server">' +
        '<p>This is the beginning of the group chat history</p>' +
        '</div>' +
        '</li>');
    group.messages.forEach(msg => {
        const isAuthor = msg.userName === user.name;
        switch (msg.messageType) {
            case MessageType.UserMessage:
                appendUserMessage(msg, isAuthor);
                break;
            case MessageType.Multimedia:
                appendFileMessage(msg, isAuthor);
                break;
            case MessageType.PrivateMessage:
                appendPrivateMessage(msg, isAuthor);
                break;
            case MessageType.PrivateMultimedia:
                appendPrivateFileMessage(msg, isAuthor);
                break;
            default:
                appendServerMessage(msg);
        }
    })
}

/*
* Function that un-hides the user invite input when group is selected.
* */
function showUserInvite() {
    $('#invite-user')[0].hidden = false;
}

/*
* Function that un-hides the message bar when group is selected.
* */
function showMessageBar() {
    $('#message-form:hidden')[0].style['display'] = 'flex'
}

/*
* Listener that, when a file is chosen, checks if the size is smaller than 1MB and inserts the file name in the label tag
* */
function onFileChosen(){
    $('input[type=file]').change((ev) => {
        const file = ev.target.files[0];
        if (file.size > 1000000) {
            alert('File size is bigger than 1 MB');
            ev.target.value = '';
            return;
        }
        $('#file-label').text(ev.target.files[0].name)
    })
}

/*
* Function that handles the form submission.
* Validates that the message is not empty.
* If it is a simple message it calls onMessageSubmit.
* If it is a message with a file it call onFileMessageSubmit.
* */
function onSubmit(socket, user, group, serverSocket) {
    $('#message-form').unbind('submit').bind('submit', () => {
        const input = $('#m');

        const fileInput = $("input[type=file]");
        const fileLength = fileInput[0].files.length;

        if (!fileLength && input.val() === '') {
            alert('Message is empty');
            return false;
        } else if (fileLength) return onFileMessageSubmit(input, fileInput, socket, user, group, serverSocket);
        else return onMessageSubmit(input, socket, user, group, serverSocket);
    });
}

/*
* Function that handles the submission of a simple message.
* It grabs the value entered by the user and emits it as a Message object.
* The Message object has some added information used to route and display the message.
* Checks the first char to see if its a private message.
* If it is a simple message it calls appendUserMessage.
* If it is a private message it calls sendPrivateMessage.
* */
function onMessageSubmit(input, socket, user, group, serverSocket){
    const message = new Message(input.val(), user.name, MessageType.UserMessage, new Date(), group.id);
    group.messages.push(message);
    input.val('');
    if (message.text[0] === '@') {
        sendPrivateMessage(message, serverSocket, group.id, user);
        return false;
    }
    socket.emit('chat message', JSON.stringify(message), (message: Message) => {
        appendUserMessage(message, true);
    });
    return false;
}

/*
* Function that handles the submission of a message with a file.
* It grabs the value and file entered by the user and emits it as a FileMessage object.
* The FileMessage object has some added information used to route and display the message and file.
* */
function onFileMessageSubmit(input, fileInput, socket, user, group, serverSocket){

    const file = fileInput[0].files[0];
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);
    fileReader.onload = (evt) => {
        const arrayBuffer = fileReader.result;
        const msg = new FileMessage(file.name, file.type, file.size, arrayBuffer, input.val(), user.name,
            MessageType.Multimedia, new Date(), group.id);
        group.messages.push(msg);
        input.val('');
        fileInput.val('');
        $('#file-label').text('Choose file');
        if (msg.text[0] === '@') {
            sendPrivateFileMessage(msg, serverSocket, group.id, user);
        } else {
            appendFileMessage(msg, true);
            socket.emit('chat message', JSON.stringify(msg));
        }
    };
    return false;
}

/*
* Function that emits a private message on a given namespace and roomId
* */
function sendPrivateMessage(message: Message, serverSocket, groupId: number, user: User) {

    const onError = (error) => appendServerMessage(new Message(error, '', MessageType.PrivateMessage, new Date(), groupId));

    const res = parsePrivateMessage(message, groupId, user, onError);

    if (res.names.length === 0) return;

    const privateMessage: PrivateMessage = new PrivateMessage(res.names, res.text, message.userName,
        MessageType.PrivateMessage, message.timeStamp, message.roomId);
    appendPrivateMessage(privateMessage, true);
    serverSocket.emit('private message', privateMessage, (error: string) => {
        onError(error);
    })
}

/*
* Function that emits a private file message on a given namespace and roomId
* */
function sendPrivateFileMessage(message: FileMessage, serverSocket, groupId: number, user: User) {

    const onError = (error) => appendServerMessage(new Message(error, '', MessageType.PrivateMessage, new Date(), groupId));

    const res = parsePrivateMessage(message, groupId, user, onError);

    if (res.names.length === 0) return;

    const privateMessage: PrivateFileMessage = new PrivateFileMessage(res.names, message.fileName, message.fileType, message.fileSize,
        message.data, res.text, message.userName, MessageType.PrivateMultimedia, message.timeStamp, message.roomId);
    appendPrivateFileMessage(privateMessage, true);
    serverSocket.emit('private message', privateMessage, (error: string) => {
        onError(error);
    })
}

/*
* Listener that is called when a user message is sent to this specific roomId and namespace.
* */
function onMessageReceived(socket, user, groups: ChatRoom[]) {
    socket.on('chat message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        groups.find(group => group.id === msg.roomId).messages.push(msg);
        if (getCurrentRoomId() === msg.roomId) appendUserMessage(msg, msg.userName === user.name);
    });
}

/*
* Function that appends a <li> to the html containing the user message.
* The way the message is presented changes according to the author of the message.
* */
function appendUserMessage(msg: Message, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = $(isAuthor ? '<div class="msg-container author">' : '<div class="msg-container">');
            if (!isAuthor) node.append($('<p class="author-name">').text(msg.userName));
            node.append($('<p>').text(msg.text))
                .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
            return node;
        }));
    scrollToBottom()
}

/*
* Listener that is called when a user message with a file is sent to this specific roomId and namespace.
* */
function onFileMessageReceived(socket, user, groups: ChatRoom[]) {
    socket.on('chat file message', (msgStr) => {
        const msg: FileMessage = JSON.parse(msgStr);
        groups.find(group => group.id === msg.roomId).messages.push(msg);
        console.log(getCurrentRoomId());
        if (getCurrentRoomId() === msg.roomId) appendFileMessage(msg, msg.userName === user.name);
    });
}

/*
* Function that appends a <li> to the html containing the user message with a file.
* The way the message is presented changes according to the author of the message.
* */
function appendFileMessage(msg: FileMessage, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = $(isAuthor ? '<div class="msg-container author">' : '<div class="msg-container">');
            if (!isAuthor) node.append($('<p class="author-name">').text(msg.userName));
            addFileHTML(msg, node);
            return node;
        }));
    scrollToBottom();
}

/*
* Scrolls the messages div to the bottom, to show the most recent messages
* */
function scrollToBottom(){
    const container = $('#messages-container');
    const height = container[0].scrollHeight;
    container.scrollTop(height);
}

/*
* Listener that is called when a server message is sent to this specific roomId and namespace.
* */
function onServerMessage(socket, groups: ChatRoom[]) {
    socket.on('server message', (msgStr) => {
        const msg: Message = JSON.parse(msgStr);
        const group: ChatRoom = groups.find(group => group.id === msg.roomId);
        if (group) group.messages.push(msg);
        if (msg.messageType === MessageType.OnlineMessage) {
            onUserStatusChange(msg.userName, true);
        } else if (msg.messageType === MessageType.OfflineMessage) {
            onUserStatusChange(msg.userName, false);
        }
        if (getCurrentRoomId() === msg.roomId) appendServerMessage(msg);
    });
}

/*
* Function that appends a <li> to the html containing the server message.
* */
function appendServerMessage(msg: Message) {
    $('#messages').append($('<li>').append($('<div class="msg-container server">')
        .append($('<p>').text(`${msg.text} (${new Date(msg.timeStamp).toLocaleTimeString('it-IT')})`))));
    window.scrollTo(0, document.body.scrollHeight);
}

/*
* Listener that is called when a private message is sent to this specific roomId and namespace.
* */
function onPrivateMessage(serverSocket, groups: ChatRoom[], user: User) {
    serverSocket.on('private message', (message: Message) => {
        const group = groups.find(group => group.id === message.roomId);
        group.messages.push(message);
        if (getCurrentRoomId() === message.roomId) appendPrivateMessage(message, user.name === message.userName);
    });
}

/*
* Function that appends a <li> to the html containing the private message.
* */
function appendPrivateMessage(msg: PrivateMessage, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = addPrivateMessageHTML(msg, isAuthor);
            node.append($('<p>').text(msg.text))
                .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
            return node;
        }));
    window.scrollTo(0, document.body.scrollHeight);
}

/*
* Listener that is called when a private message with a file is sent to this specific roomId and namespace.
* */
function onPrivateFileMessage(serverSocket, groups: ChatRoom[], user: User) {
    serverSocket.on('private file message', (message: PrivateFileMessage) => {
        const group = groups.find(group => group.id === message.roomId);
        group.messages.push(message);
        if (getCurrentRoomId() === message.roomId) appendPrivateFileMessage(message, user.name === message.userName);
    });
}

/*
* Function that appends a <li> to the html containing the private file message.
* */
function appendPrivateFileMessage(msg: PrivateFileMessage, isAuthor: boolean) {
    $('#messages').append($('<li>')
        .append(() => {
            const node = addPrivateMessageHTML(msg, isAuthor);
            addFileHTML(msg, node);
            return node;
        }));
    window.scrollTo(0, document.body.scrollHeight);
}

/*
* Function that appends the file, date and the text of the message.
* If the file is an image it appends a preview of such image.
* */
function addFileHTML(msg, node){
    if (msg.fileType.includes('image'))
        node.append($('<div class="file-container">')
            .append($(`<a href="${msg.data}" download="${msg.fileName}">`)
                .append($(`<img src="${msg.data}" alt="">`))));
    else {
        node.append($('<div class="file-container row align-items-center">')
            .append($(`<i class="material-icons">`).text('insert_drive_file'))
            .append($(`<a href="${msg.data}" download="${msg.fileName}">`).text(msg.fileName)));
    }
    node.append($('<p>').text(msg.text))
        .append($('<p class="time">').text(new Date(msg.timeStamp).toLocaleTimeString('it-IT')));
}

/*
* Function that appends the header of a private message.
* If the message is a multicast it appends a dropdown containing the names of the recipients.
* */
function addPrivateMessageHTML(msg, isAuthor) {
    console.log(msg.nicknames);
    return $(isAuthor ? '<div class="msg-container private-message author">' : '<div class="msg-container private-message">')
        .append(`<div class="row">
                    ${!isAuthor ? `<p class="author-name private-message">${msg.userName}</p>` : ''}
                    ${msg.nicknames.length > 1 ? `<div class="dropdown ${isAuthor ? 'dropleft' : ''}">
                        <div class="dropdown-toggle" id="dropdownMenu2"
                             data-toggle="dropdown"
                             aria-haspopup="true" aria-expanded="false">
                        </div>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenu2" id="user-list">
                            ${msg.nicknames.map(nickname => `<div class="dropdown-item">${nickname}</div>`).join('')}
                       </div>
                   </div>` : ''}
                </div>`);
}

/*
* Function that parses the user input of a private message (it starts with '@')
* The following formats are correct:
* '@name1, name2, name3, name4 message'
* or
* '@name message'
* or
* '@name' (only if the message has a file)
* The function splits the input value by the ', ' or ',' character.
* Then the last element of the generated array contains a name and the message text.
* The function splits the last element by the ' ' character.
* Finally the function returns the names array and the text.
* The following formats are incorrect:
* '@name1, name2, name3, message'
* or
* '@name1, @name2, @name3, message'
* or
* '@name1 @name2 @name3 message'
* or
* '@name1 name2 name3 message'
* or
* '@name '
* */
function parsePrivateMessage(message: Message | FileMessage, groupId: number, user: User, errorCallback): {names:string[], text:string} {
    let names: string[] = message.text.slice(1).split(new RegExp(", |,"));
    if (names.length === 0) {
        errorCallback('@ needs to be followed by the usernames separated by ","');
        return {names: [], text: ''};
    }
    const lastNameWithText = names[names.length - 1];
    const index = lastNameWithText.indexOf(' ');
    let text: string = '';
    if (index !== -1) {
        names[names.length - 1] = lastNameWithText.substr(0, index);
        text = lastNameWithText.substr(index);
    }
    names = names.filter(name => user.name !== name);
    if (!text && message.messageType !== MessageType.Multimedia) {
        errorCallback('Please add a message to the private message');
        return {names: [], text: ''};
    }
    if (names.length === 0) {
        errorCallback('You can\'t send a private message to yourself ');
        return {names: [], text: ''};
    }
    return {names, text};
}

/*
* Gets the current room id from the DOM.
* */
export function getCurrentRoomId(): number {
    const id: string = $('#chat-group-id').text();
    return id ? Number(id) : undefined;
}
