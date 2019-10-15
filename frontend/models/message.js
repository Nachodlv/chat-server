export class Message {
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;

    static MessageType ={
        ServerMessage: 'ServerMessage',
        ChatInvite: 'ChatInvite',
        UserMessage: 'UserMessage',
        Multimedia: 'Multimedia'
    };

    constructor(text: string, userName: string, messageType: string,
                timeStamp: Date = new Date()) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
    }
}
