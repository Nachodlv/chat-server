/*
* Web socket used to send and receive private messages such as whispers and multicast.
* */
module.exports = class PrivateMessagesWebSocket {
    privateMessageProvider: PrivateMessageProvider;
    roomProvider: ChatRoomProvider;
    translatorService: TranslatorService;

    constructor(io, privateMessageProvider: PrivateMessageProvider, roomProvider: ChatRoomProvider, translatorService: TranslatorService) {
        this.privateMessageProvider = privateMessageProvider;
        this.roomProvider = roomProvider;
        this.translatorService = translatorService;
        this.namespace = io.of('/');
        this.assignCallbacks();
    }

    /*
    * Assign callback for the connection of the users in the default socket.
    * */
    assignCallbacks() {
        this.namespace.on('connection', (socket) => {
            this.onWhisper(socket);
        });
    }

    /*
    * When a private message is received it sends the message to the corresponding users.
    * */
    //TODO test
    onWhisper(socket) {
        socket.on('private message', (message: PrivateMessage | PrivateFileMessage, callback: (message: Message, errorMessage: string) => void) => {
            // this.privateMessageProvider.createModel(message);
            this.privateMessageProvider.createPrivateMessage(message, (savedMessage, messageError) => {
                if (messageError) {
                    callback(undefined, messageError);
                    return
                }
                // const room: ChatRoom = this.roomProvider.getModel(message.roomId);
                this.roomProvider.getChatRoomById(savedMessage.roomId, (room, roomError) => {
                    if(roomError) {
                        callback(undefined, roomError);
                        return
                    }
                    const users: User[] = room.users;
                    let successful: boolean = true;
                    let errorOnUser: string = '';
                    const ids: number[] = savedMessage.nicknames.map(name => {
                        const user: User = users.find(user => user.name === name);
                        if(user) return user.id;
                        errorOnUser = name;
                        successful = false;
                    });
                    if(!successful) {
                        callback(undefined, `The user ${errorOnUser} is not present in the room`);
                        return
                    }
                    this.translatorService.translatate(savedMessage.text, (translatedMessage) => {
                        savedMessage.text = translatedMessage;
                        callback(savedMessage, undefined);
                        if (savedMessage.messageType === 'PrivateMultimedia')
                            ids.forEach(id => this.namespace.to(id).emit('private file message', savedMessage));
                        else ids.forEach(id => this.namespace.to(id).emit('private message', savedMessage));
                        console.log(`${savedMessage.nicknames}(${savedMessage.userName}): ${savedMessage.text}`);
                    });
                });
            });
        });
    }
};
