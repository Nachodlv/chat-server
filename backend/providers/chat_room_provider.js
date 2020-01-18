class ChatRoomProvider {

    constructor(ChatRoom, User, Message, db2Service: Db2Service) {
        this.ChatRoom = ChatRoom;
        this.User = User;
        this.Message = Message;
        this.db2Service = db2Service;

        //TEST
        /*this.createChatRoom(new ChatRoom("LD", 1), (room, _) => {
            console.log(room);
            this.getChatRoomById(room.id, (newRoom, _) => {
                console.log(newRoom)
            })
        });

        this.getChatRoomById(2, (room, _) => {
            console.log(room);
        });

        this.getChatRoomsByIds([2,3,4], (rooms, _) => {
            console.log(rooms);
        });*/
    }

    getChatRoomById(id: number, callback: (chatRoom: ChatRoom, error: string) => void) {
        // WHERE clause is executed before join (im not sure)
        this.db2Service.executeSql(
            `SELECT c.*, u.*
                    FROM QQL85939.CHAT_ROOM c
                    INNER JOIN QQL85939.USER_CHAT_ROOM cu
                    ON cu.chat_room_id = c.id
                    INNER JOIN QQL85939.USER u
                    ON u.id = cu.user_id
                    WHERE c.id='${id}'`
            , (body, error) => {
                if (!error) {
                    if (body.results.length > 0 && body.results[0].rows.length > 0) {
                        this.getRoomMessages(id, body.results[0].rows, callback);
                    } else callback(undefined, "No chat room was found with that id");
                } else {
                    callback(undefined, "An error occurred while trying to get the chat room")
                }
            }, false);
    }

    getRoomMessages(id: number, rows:any[], callback: (chatRoom: ChatRoom, error: string) => void){
        this.db2Service.executeSql(
            `SELECT m.*
                    FROM QQL85939.MESSAGE m
                    WHERE m.CHAT_ROOM_ID='${id}'`
            , (body, error) => {
                if (!error) {
                    if (body.results.length > 0 && body.results[0].rows.length > 0) {
                        callback(this.chatRoomTableToModel(rows, body.results[0].rows));
                    } else callback(this.chatRoomTableToModel(rows));
                } else {
                    callback(undefined, "An error occurred while trying to get the chat room messages")
                }
            }, false);
    }

    getChatRoomsByIds(ids: number[], callback: (chatRooms: ChatRoom[], error: string) => void) {
        // WHERE clause is executed before join (im not sure)
        this.db2Service.executeSql(
            `SELECT c.*, u.*
                    FROM QQL85939.CHAT_ROOM c
                    INNER JOIN QQL85939.USER_CHAT_ROOM cu
                    ON cu.chat_room_id = c.id
                    INNER JOIN QQL85939.USER u
                    ON u.id = cu.user_id
                    WHERE c.id IN (${ids.reduce((prev, curr) => {return `${prev},${curr}`;})})`
            , (body, error) => {
                if (!error) {
                    if(body.results.length > 0 && body.results[0].rows.length > 0) {
                        this.getRoomsMessages(ids, body.results[0].rows, callback);
                    } else callback(undefined, "No chat room was found with that id");
                } else {
                    callback(undefined, "An error occurred while trying to get the chat room")
                }
            }, false);
    }

    getRoomsMessages(ids: number[], rows:any[], callback: (chatRoom: ChatRoom, error: string) => void){
        this.db2Service.executeSql(
            `SELECT m.*
                    FROM QQL85939.MESSAGE m
                    WHERE m.CHAT_ROOM_ID IN (${ids.reduce((prev, curr) => {return `${prev},${curr}`;})})`
            , (body, error) => {
                if (!error) {
                    if (body.results.length > 0 && body.results[0].rows.length > 0) {
                        callback(this.chatRoomsTableToModels(rows, body.results[0].rows));
                    } else callback(this.chatRoomsTableToModels(rows));
                } else {
                    callback(undefined, "An error occurred while trying to get the chat room messages")
                }
            }, false);
    }

    /*
    * ex:
    * chatRoom: {
    *   id: undefined,
    *   name: "New Group Name",
    *   ownerId: 12,
    *   users: [ownerUserObject]
    *   messages: []
    * }
    * */
    createChatRoom(chatRoom: ChatRoom, callback: (chatRoom: ChatRoom, error: string) => void) {
        this.db2Service.executeSql(`SELECT * FROM FINAL TABLE (INSERT INTO QQL85939.CHAT_ROOM (NAME, OWNER_ID) 
                                VALUES ('${chatRoom.name}', integer('${chatRoom.ownerId}')))`,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    chatRoom.id = Number(body.results[0].rows[0][0]);
                    this.addUserToChatRoom(chatRoom.ownerId, chatRoom.id, error => {
                        if(!error) {
                            callback(chatRoom, "");
                        } else callback(undefined, error)
                    })
                } else callback(undefined, "Error occurred while trying to create the chat room")
            });
    }

    /*getChatRoomById(id: string, callback: (user: User, error: string) => void) {
        this.executeSql("SELECT * FROM QQL85939.user where id = " + id, (body, error) => {
            if (!error) {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    callback(this.userTableToModel(body.results[0].rows[0]));
                } else callback(undefined, "No user was found with that id");
            } else callback(undefined, "An error occurred while trying to get the user " + id);
        });
    }*/

   /* updateChatRoom(user: User, callback: (user: User, error: string) => void) {
        this.updateChatRooms(user);
        this.executeSql(`UPDATE QQL85939.USER SET ONLINE = ${user.online} WHERE ID = ${user.id}`, (body, error) => {
            if(body.results.length > 0 && body.results[0].rows_affected === 1) {
                callback(user);
            } else callback(undefined, "An error occurred while trying to update the user");
        });
    }*/

    addUserToChatRoom(userId: number, chatRoomId: number, callback: (error) => void) {
        this.db2Service.executeSql(`INSERT INTO QQL85939.USER_CHAT_ROOM (USER_ID, CHAT_ROOM_ID) 
                                VALUES (integer('${userId}'), integer('${chatRoomId}'))`,
            (body, error) => {
                if(!error) {
                    callback();
                } else callback("Error occurred while trying to add user to the chat room")
        });
    }

    saveMessage(message: Message, callback: (newMessage: Message, error: string) => void) {
        this.db2Service.executeSql(`SELECT * FROM FINAL TABLE (INSERT INTO QQL85939.MESSAGE (TEXT, CHAT_ROOM_ID, USERNAME, TIMESTAMP, TYPE) 
                                VALUES ('${message.text}', integer('${message.roomId}'), '${message.userName}', '${this.formatTimeStampString(message.timeStamp)}', '${message.messageType}'))`,
            (body, error) => {
                if(body.results.length > 0 && body.results[0].rows.length > 0) {
                    message.id = Number(body.results[0].rows[0][0]);
                    callback(message);
                } else callback(undefined, "Error occurred while trying to save the message")
        });
    }

    chatRoomTableToModel(rows: any[], messageRows: any[] = []): ChatRoom {
        const id = Number(rows[0][0]);
        const name = rows[0][1];
        const ownerId = Number(rows[0][2]);
        const users = rows.map( row => new this.User(row.slice(3,8))); // TODO users do not have the correct chat_rooms array
        const messages = messageRows.map( row =>
            new this.Message(row[1], row[3], row[5], new Date(row[4]), Number(row[2]), Number(row[0]))
        );
        return new this.ChatRoom(name, ownerId, id, users, messages);
    }

    chatRoomsTableToModels(rows: any[], messageRows: any[] = []): ChatRoom[] {
        const groupedRows: any = this.groupBy(rows, 0);
        const groupedMessages: any = this.groupBy(messageRows, 2);
        let result = [];
        Object.keys(groupedRows).forEach(key => {
            const data = groupedRows[key];
            const messagesData = groupedMessages[key];

            result.push(this.chatRoomTableToModel(data, messagesData));
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

module.exports = ChatRoomProvider;
