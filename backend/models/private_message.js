class PrivateMessage extends Message {
    userIds: number[];

    constructor(userIds: number[], text: string, userName: string, messageType: MessageType = MessageType.UserMessage,
                roomId: number, timeStamp: Date = Date.now()) {
        super(text, userName, messageType, roomId, timeStamp);
        this.userIds = userIds;
    }
}

module.exports = PrivateMessage;