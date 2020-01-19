class PrivateMessage{
    id: number;
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;
    roomId: number;

    // private msg attributes
    nicknames: string[];

    constructor(nicknames: string[], text: string, userName: string, messageType: string,
                timeStamp: Date, roomId: number, id?:number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
        this.id = id;

        // private msg attributes
        this.nicknames = nicknames;
    }
}

module.exports = PrivateMessage;
