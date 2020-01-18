class PrivateMessage extends Message {
    nicknames: string[];

    constructor(nicknames: string[], text: string, userName: string, messageType: string,
                roomId: number, timeStamp: Date = new Date()) {
        super(text, userName, messageType, timeStamp, roomId);
        this.nicknames = nicknames;
    }
}

module.exports = PrivateMessage;
