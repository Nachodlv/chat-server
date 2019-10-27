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
    Multimedia: 'Multimedia',
    PrivateMultimedia: 'PrivateMultimedia'
};

export class FileMessage extends Message {

    fileName: string;
    fileType: string;
    fileSize: string;
    data: any;

    constructor(fileName: string, fileType: string, fileSize: string, data: any, text: string,
                userName: string, messageType: string, timeStamp: Date = new Date(), roomId: number) {
        super(text, userName, messageType, timeStamp, roomId);
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.data = data;
    }
}

export class PrivateMessage extends Message {

    nicknames: string[];

    constructor(nicknames: string[], text: string, userName: string, messageType: string,
                timeStamp: Date = new Date(), roomId: number) {
        super(text, userName, messageType, timeStamp, roomId);
        this.nicknames = nicknames;
    }
}

export class PrivateFileMessage extends FileMessage {

    nicknames: string[];

    constructor(nicknames: string[], fileName: string, fileType: string, fileSize: string, data: any, text: string,
                userName: string, messageType: string, timeStamp: Date = new Date(), roomId: number) {
        super(fileName, fileType, fileSize, data, text, userName, messageType, timeStamp, roomId);
        this.nicknames = nicknames;
    }
}
