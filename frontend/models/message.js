export class Message {
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;
    roomId: number;

    constructor(text: string, userName: string, messageType: string,
                timeStamp: Date = new Date(), roomId: number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
    }
}

export const MessageType = {
    PrivateMessage: 'PrivateMessage',
    OnlineMessage: 'OnlineMessage',
    OfflineMessage: 'OfflineMessage',
    ServerMessage: 'ServerMessage',
    ChatInvite: 'ChatInvite',
    UserMessage: 'UserMessage',
    Multimedia: 'Multimedia'
};

export class PrivateMessage extends Message {

    nicknames: string[];

    constructor(nicknames: string[], text: string, userName: string, messageType: string,
                timeStamp: Date = new Date(), roomId: number) {
        super(text, userName, messageType, timeStamp, roomId);
        this.nicknames = nicknames;
    }
}