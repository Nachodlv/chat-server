//extends does not work
class FileMessage {
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

    constructor(fileName: string, fileType: string, fileSize: string, link: string, text: string,
                userName: string, messageType: string, timeStamp: Date,
                roomId: number, id?:number) {
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
    }
}

module.exports = FileMessage;
