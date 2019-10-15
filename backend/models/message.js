module.exports = class Message {
    text: string;
    userName: string;
    messageType: MessageType;
    timeStamp: Date;

    constructor(text: string, userName: string, messageType: MessageType = MessageType.UserMessage,
                timeStamp: Date = Date.now()) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
    }
};

const MessageType = {
    ServerMessage: 'ServerMessage',
    ChatInvite: 'ChatInvite',
    UserMessage: 'UserMessage',
    Multimedia: 'Multimedia'
};