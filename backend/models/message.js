class Message {
    id: number;
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;
    roomId: number;

    constructor(text: string, userName: string, messageType: string,
                timeStamp: Date = new Date(), roomId: number, id?:number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
        this.id = id;
    }
}

module.exports = Message;
