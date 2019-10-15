class ChatWebSocket {

    constructor(io, Message: Message) {
        this.namespace = io.of('chat-room');
        this.Message = Message;
    }

    sendMessageToChat(chat: ChatRoom, message: Message) {
        this.namespace.to(chat.id).emit(JSON.stringify(message))
    }
}

module .exports = ChatWebSocket;