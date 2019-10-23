class PrivateMessage extends Message {
    nicknames: string[];

    constructor(nicknames: string[], text: string, userName: string, messageType: MessageType = MessageType.UserMessage,
                roomId: number, timeStamp: Date = Date.now()) {
        super(text, userName, messageType, roomId, timeStamp);
        this.nicknames = nicknames;
    }
}

module.exports = PrivateMessage;