/*
* Provides the routes for the chat view and the ABM for the chat room
* */
class ChatRoomController {
    dirname: string;
    chatRoomProvider: Provider;
    userProvider: UserProvider;
    privateMessageProvider: Provider;

    constructor(app, chatRoomProvider: Provider, userProvider: UserProvider, privateMessagesProvider: Provider, dirname: string) {
        this.app = app;
        this.chatRoomProvider = chatRoomProvider;
        this.userProvider = userProvider;
        this.privateMessageProvider = privateMessagesProvider;
        this.dirname = dirname;
        this.chatView();
        this.getChatRoom();
        this.getChatRooms();
        this.newChatRoom()
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
            const userId = JSON.parse(req.cookies.user).id;
            const roomId = Number(req.params['roomId']);
            const room = this.chatRoomProvider.getModel(roomId);
            if (!room) {
                res.status(404);
                res.send('No chat room found with id: ' + roomId);
                return;
            }
            res.status(200);
            res.send(JSON.stringify(this._attachPrivateMessage(room, userId)));
        });
    }

    /*
    * Returns the chat rooms with the ids provided in the url.
    * If no chat room is found, it returns a status code 404.
    * */
    getChatRooms() {
        this.app.get('/chat-rooms', (req, res) => {
            const userNickname = JSON.parse(req.cookies.user).name;
            const roomIds = Array.isArray(req.query.ids) ? req.query.ids : [req.query.ids];
            const rooms = roomIds.map(roomId => this.chatRoomProvider.getModel(Number(roomId)));
            if (!rooms || rooms.length === 0) {
                res.status(404);
                res.send('No chat room found for current user');
                return;
            } else if (rooms.filter(r => !r).length !== 0) {
                res.status(404);
                res.send('Invalid room id');
                return;
            }
            res.status(200);
            const rooms2 = rooms.map(room => this._attachPrivateMessage(room, userNickname));
            res.send(JSON.stringify(rooms2));
        });
    }

    /*
    * Creates a new group.
    * If it is successful it will return a status code 200.
    * */
    newChatRoom() {
        this.app.post('/chat-room', (req, res) => {
            const room: ChatRoom = req.body;
           this.userProvider.getUserById(room.ownerId, (user, _) => {
               if (user === undefined) {
                   res.status(404);
                   res.send('No user was found with id: ' + room.ownerId);
                   return;
               }
               room.users.push(user);
               const newRoom = this.chatRoomProvider.createModel(room);
               user.chatRooms.push(newRoom.id);
               this.userProvider.updateUser(user, (updatedUser, error) => {
                   if(!error && updatedUser !== undefined) {
                       res.status(200);
                       res.send(JSON.stringify(newRoom));
                   } else {
                       res.status(500);
                       res.send("Error while updating the user");
                   }
               });

           });
        });
    }

    /*
    * Attaches the private messages to the chat room.
    * */
    _attachPrivateMessage(room: ChatRoom, userNickname: string): ChatRoom {
        const messages: PrivateMessage[] = this.privateMessageProvider.models.filter((message: PrivateMessage) =>
            message.roomId === room.id && (message.userName === userNickname || message.nicknames.find(nickname => nickname === userNickname)));
        const clonedRoom: ChatRoom = JSON.parse(JSON.stringify(room));
        clonedRoom.messages.push(...messages);
        return clonedRoom;
    }
}

module.exports = ChatRoomController;
