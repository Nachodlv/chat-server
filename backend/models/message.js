class Message {
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
}

module.exports = Message;
