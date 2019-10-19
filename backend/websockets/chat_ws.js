/*
* Web socket to send messages inside each chat room
* */
class ChatWebSocket {

    message: Message;
    chatRoomProvider: Provider;

    constructor(io, Message: Message, chatRoomProvider: Provider) {
        this.Message = Message;
        this.namespace = io.of('/chat-room');
        this.assignCallbacks();
        this.chatRoomProvider = chatRoomProvider;
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
            const message: Message = JSON.parse(msg);
            const room: ChatRoom = this.chatRoomProvider.getModel(message.roomId);
            room.messages.push(message);
            socket.to(message.roomId).emit('chat message', msg);
            console.log(message.userName + "(" + message.roomId +"): " + message.text)
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
