/*
* Web socket to send messages inside each chat room
* */

class ChatWebSocket {

    message: Message;
    chatRoomProvider: Provider;

    constructor(io, Message: Message, chatRoomProvider: Provider, requestLib) {
        this.Message = Message;
        this.namespace = io.of('/chat-room');
        this.assignCallbacks();
        this.chatRoomProvider = chatRoomProvider;
        this.request = requestLib;
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
        socket.on('chat message', (msg) => {
            const message: Message | FileMessage = JSON.parse(msg);
            const room: ChatRoom = this.chatRoomProvider.getModel(message.roomId);

            this.request({url: 'https://eu-de.functions.cloud.ibm.com/api/v1/web/Gianluca.Scolaro%40Student.Reutlingen-University.DE_dev/hrt-demo/identify-and-translate', qs:{text: message.text}}, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    const translations = JSON.parse(response.body).translations;
                    message.text = translations !== undefined ? translations : message.text;
                }
                room.messages.push(message);
                if (message.messageType === 'UserMessage') {
                    socket.to(message.roomId).emit('chat message', msg);
                    console.log(message.userName + "(" + message.roomId +"): " + message.text)
                } else {
                    socket.to(message.roomId).emit('chat file message', msg);
                    console.log(message.userName + "(" + message.roomId +"): " + message.fileName)
                }
            });
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
