module.exports = class Message {
    text: string;
    userName: string;
    messageType: MessageType;
    timeStamp: Date;
    roomId: number;

    constructor(text: string, userName: string, messageType: MessageType = MessageType.UserMessage, roomId: number,
                timeStamp: Date = Date.now()) {
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