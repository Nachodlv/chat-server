export class Message {
    constructor(text, userName, messageType = MessageType.UserMessage, timeStamp = Date.now()) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
    }
}

export const MessageType = {
    ServerMessage: 'ServerMessage',
    ChatInvite: 'ChatInvite',
    UserMessage: 'UserMessage',
    Multimedia: 'Multimedia'
};