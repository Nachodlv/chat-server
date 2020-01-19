class PrivateFileMessage{
    id: number;
    text: string;
    userName: string;
    timeStamp: Date;
    messageType: string;
    roomId: number;

    // file attributes
    fileName: string;
    fileType: string;
    fileSize: string;
    link: string;

    // private msg attributes
    nicknames: string[];

    constructor(nicknames: string[], fileName: string, fileType: string, fileSize: string, link: string, text: string,
                userName: string, messageType: string, timeStamp: Date, roomId: number, id?: number) {
        this.text = text;
        this.userName = userName;
        this.messageType = messageType;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
        this.id = id;

        //file attributes
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.link = link;

        // private msg attributes
        this.nicknames = nicknames;
    }
}

module.exports = PrivateFileMessage;
