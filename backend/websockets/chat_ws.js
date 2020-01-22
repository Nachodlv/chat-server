/*
* Web socket to send messages inside each chat room
* */

class ChatWebSocket {

    chatRoomProvider: ChatRoomProvider;
    translatorService: TranslatorService;
    objectStorageService: ObjectStorageService;

    constructor(io, Message: Message, MessageType: MessageType, chatRoomProvider: ChatRoomProvider, objectStorageService: ObjectStorageService, translatorService: TranslatorService) {
        this.Message = Message;
        this.MessageType = MessageType;
        this.namespace = io.of('/chat-room');
        this.assignCallbacks();
        this.chatRoomProvider = chatRoomProvider;
        this.objectStorageService = objectStorageService;
        this.translatorService = translatorService;
    }

    /*
    * Assign callbacks for chat messages and server messages.
    * Retrieves the room id in the socket handshake provided by the client connecting.
    * If the user does not exists the callback is ended.
    * */
    assignCallbacks() {
        this.namespace.on('connection', (socket) => {
            this.onJoin(socket);
            this.onMessage(socket);
            this.onServerMessage(socket);
        });
    }

    /*
    * Joins the socket to a roomId
    * */
    onJoin(socket) {
        socket.on('join', (roomId) => {
            socket.join(roomId);
        })
    }

    /*
    * When a chat message is send it attaches the message to the chat group in the provider and emits it.
    * */
    onMessage(socket) {
        socket.on('chat message', (msg, messageTranslated: (Message | FileMessage) => void) => {
            const message: Message | FileMessage = JSON.parse(msg);
            // message.timeStamp = new Date(message.timeStamp);
            // const room: ChatRoom = this.chatRoomProvider.getModel(message.roomId);
            this.translatorService.translatate(message.text, (translatedMessage) => {
                message.text = translatedMessage;
                // room.messages.push(message);
                if (message.messageType === this.MessageType.Multimedia) {
                    this.objectStorageService.putObject(message.roomId + message.timeStamp.toString(), message.fileName,
                        message.fileType, message.fileSize, message.link, (fileKey:string, error) => {
                            if(error) {
                                console.log(error);
                                return
                            }
                            message.link = fileKey;
                            this.saveMessage(socket, message, messageTranslated);
                    })
                } else {
                    this.saveMessage(socket, message, messageTranslated)
                }

            });

        });
    }

    saveMessage(socket, message: Message | FileMessage, callback: (Message | FileMessage) => void) {
        this.chatRoomProvider.saveMessage(message, (newMessage, error) => {
            if (newMessage === undefined) {
                console.log(error);
                return;
            }
            callback(message);
            if (message.messageType === 'UserMessage') {
                socket.to(message.roomId).emit('chat message', JSON.stringify(message));
                console.log(message.userName + "(" + message.roomId +"): " + message.text)
            } else {
                socket.to(message.roomId).emit('chat file message', JSON.stringify(message));
                console.log(message.userName + "(" + message.roomId +"): " + message.fileName)
            }
        });
    }

    /*
    * When a server message is send it emits it.
    * */
    onServerMessage(socket) {
        socket.on('server message', (msg) => {
            const message: Message = JSON.parse(msg);
            socket.to(message.roomId).emit(msg);
        })
    }

    /*
    * Emits a message to the chat room specified.
    * */
    sendMessageToChat(chatRoomId: number, message: Message) {
        this.namespace.to(chatRoomId).emit('server message', JSON.stringify(message));
    }

}

module.exports = ChatWebSocket;
