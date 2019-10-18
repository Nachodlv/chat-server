/*
* Provides the routes for the chat view and the ABM for the chat room
* */
class ChatRoomController {
    dirname: string;
    chatRoomProvider: Provider;
    constructor(app, chatRoomProvider: Provider, dirname: string) {
        this.app = app;
        this.chatRoomProvider = chatRoomProvider;
        this.dirname = dirname;
        this.chatView();
        this.getChatRoom();
        this.getChatRooms();
    }

    /*
    * Returns the view of the index.html
    * */
    chatView() {
       this.app.get('/', (req, res) =>
           res.sendFile(this.dirname + '/frontend/views/chat/index.html')
       );
    }

    /*
    * Returns the chat room with the id provided in the url.
    * If no chat room is found, it returns a status code 404.
    * */
    getChatRoom() {
        this.app.get('/chat-room/:roomId*', (req, res) => {
            const roomId = Number(req.params['roomId']);
            const room = this.chatRoomProvider.getModel(roomId);
            if(!room) {
                res.status(404);
                res.send('No chat room found with id: ' + roomId);
                return;
            }
            res.status(200);
            res.send(JSON.stringify(room));
        });
    }

    /*
    * Returns the chat rooms with the ids provided in the url.
    * If no chat room is found, it returns a status code 404.
    * */
    getChatRooms() {
        this.app.get('/chat-rooms', (req, res) => {
            const roomIds = Array.isArray(req.query.ids) ? req.query.ids : [req.query.ids];
            const rooms = roomIds.map(roomId => this.chatRoomProvider.getModel(Number(roomId)));
            if(!rooms || rooms.length === 0) {
                res.status(404);
                res.send('No chat room found for current user');
                return;
            } else if(rooms.filter(r => !r).length !== 0) {
                res.status(404);
                res.send('Invalid room id');
                return;
            }
            res.status(200);
            res.send(JSON.stringify(rooms));
        });
    }
}

module.exports = ChatRoomController;
