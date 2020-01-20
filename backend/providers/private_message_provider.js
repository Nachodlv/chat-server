class PrivateMessageProvider {

    constructor(PrivateMessage, PrivateFileMessage, MessageType, db2Service: Db2Service) {
        this.PrivateMessage = PrivateMessage;
        this.PrivateFileMessage = PrivateFileMessage;
        this.MessageType = MessageType;
        this.db2Service = db2Service;
    }

    getPrivateMessagesByRoomsId(roomIds: number[], callback: (messages: any, error: string) => void) {
        // WHERE clause is executed before join (im not sure)
        this.db2Service.executeSql(
            `SELECT pm.*, n.*
                    FROM QQL85939.PRIVATE_MESSAGE pm
                    LEFT JOIN QQL85939.PRIVATE_MESSAGE_NICKNAME n
                    ON n.PRIVATE_MESSAGE_ID = pm.id
                    WHERE pm.CHAT_ROOM_ID IN (${roomIds.reduce((prev, curr) => {return `${prev},${curr}`;})})`
            , (body, error) => {
                if (!error) {
                    if (body.results.length > 0 && body.results[0].rows.length > 0) {
                        callback(this.privateMessagesTableToModels(body.results[0].rows));
                    } else callback(undefined, undefined); // no private message is not an error
                } else {
                    callback(undefined, "An error occurred while trying to get the private messages")
                }
            }, false);
    }

    createPrivateMessage(message: PrivateMessage | PrivateFileMessage, callback: (newMessage: PrivateMessage | PrivateFileMessage, error: string) => void) {
        const msgQuery = `INSERT INTO QQL85939.PRIVATE_MESSAGE (TEXT, USER_NAME, TIME_STAMP, TYPE, CHAT_ROOM_ID) 
                                VALUES ('${message.text}', '${message.userName}', '${this.formatTimeStampString(message.timeStamp)}', '${message.messageType}', integer('${message.roomId}'))`;
        const fileMsgQuery = `INSERT INTO QQL85939.PRIVATE_MESSAGE (TEXT, USER_NAME, TIME_STAMP, TYPE, CHAT_ROOM_ID, FILE_NAME, FILE_TYPE, FILE_SIZE, LINK) 
                                VALUES ('${message.text}', '${message.userName}', '${this.formatTimeStampString(message.timeStamp)}', '${message.messageType}', integer('${message.roomId}'), '${message.fileName}', '${message.fileType}', '${message.fileSize}', '${message.link}')`;
        const query = `SELECT * FROM FINAL TABLE (${message.messageType === this.MessageType.PrivateMultimedia ? fileMsgQuery : msgQuery})`;

        this.db2Service.executeSql(query,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    message.id = Number(body.results[0].rows[0][0]);
                    this.addNicknames(message, callback);
                } else callback(undefined, "Error occurred while trying to save the private message")
        });
    }

    // TODO should delete private_message if it fails
    addNicknames(message: PrivateMessage | PrivateFileMessage, callback: (newMessage: PrivateMessage | PrivateFileMessage, error: string) => void){
        const values = message.nicknames.map(nickname => `('${nickname}', integer('${message.id}'))`);

        this.db2Service.executeSql(`INSERT INTO QQL85939.PRIVATE_MESSAGE_NICKNAME (NICKNAME, PRIVATE_MESSAGE_ID) 
                                VALUES ${values.reduce((prev, curr) => `${prev}, ${curr}`)};`,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows_affected > 0) {
                    callback(message);
                } else callback(undefined, "Error occurred while trying to save the message nicknames")
        });
    }

    privateMessageToModel(rows: any[]): PrivateFileMessage | FileMessage {
        const id = Number(rows[0][0]);
        const text = rows[0][1];
        const userName = rows[0][2];
        const timeStamp = new Date(rows[0][3]);
        const type = rows[0][4];
        const roomId = Number(rows[0][5]);
        const nicknames = rows.map(row => row[10]);

        if (type === this.MessageType.PrivateMultimedia) {
            const fileName = rows[0][6];
            const fileType = rows[0][7];
            const fileSize = rows[0][8];
            const link = rows[0][9];

            return new this.PrivateFileMessage(nicknames, fileName, fileType, fileSize, link, text,
                userName, type, timeStamp, roomId, id)
        }

        return new this.PrivateMessage(nicknames, text,
            userName, type, timeStamp, roomId, id)
    }

    privateMessagesTableToModels(rows: any[]): any {
        const groupedByRoomId: any = this.groupBy(rows, 5);
        let result = {};
        Object.keys(groupedByRoomId).forEach(key => {
            const groupedByMsgId: any = this.groupBy(groupedByRoomId[key], 0);
            let partialResult = [];
            Object.keys(groupedByMsgId).forEach(key => {
                const data = groupedByMsgId[key];
                partialResult.push(this.privateMessageToModel(data));
            });
            result[key] = partialResult
        });
        return result;
    }

    groupBy(array, key) {
        return array.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    formatTimeStampString(timeStamp: string): string {
        return timeStamp.slice(0,19).replace('T',' ')
    }
}

module.exports = PrivateMessageProvider;
