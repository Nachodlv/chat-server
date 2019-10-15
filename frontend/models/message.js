export class Message {
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;
    roomId: number;

    static MessageType ={
        ServerMessage: 'ServerMessage',
        ChatInvite: 'ChatInvite',
        UserMessage: 'UserMessage',
        Multimedia: 'Multimedia'
    };

    constructor(text: string, userName: string, messageType: string,
                timeStamp: Date = new Date(), roomId: number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
    }
}
