module.exports = class Message {
    text: string;
    userName: string;
    messageType: MessageType;
    timeStamp: Date;
    roomId: number;

    constructor(text: string, userName: string, messageType: MessageType = MessageType.UserMessage,
                timeStamp: Date = Date.now(), roomId: number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
    }
};

const MessageType = {
    ServerMessage: 'ServerMessage',
    ChatInvite: 'ChatInvite',
    UserMessage: 'UserMessage',
    Multimedia: 'Multimedia'
};