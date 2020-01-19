/*
* Provides the routes for the chat view and the ABM for the chat room
* */
class ChatRoomController {
    dirname: string;
    chatRoomProvider: ChatRoomProvider;
    userProvider: UserProvider;
    privateMessageProvider: PrivateMessageProvider;

    constructor(app, chatRoomProvider: ChatRoomProvider, userProvider: UserProvider, privateMessagesProvider: PrivateMessageProvider, dirname: string) {
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
            const userId = Number(req.cookies.userId);
            const roomId = Number(req.params['roomId']);
            // const room = this.chatRoomProvider.getModel(roomId);
            this.chatRoomProvider.getChatRoomById(roomId, (room, _) => {
                if (!room) {
                    res.status(404);
                    res.send('No chat room found with id: ' + roomId);
                    return;
                }
                res.status(200);
                res.send(JSON.stringify(this._attachPrivateMessage(room, userId)));
            });
        });
    }

    /*
    * Returns the chat rooms with the ids provided in the url.
    * If no chat room is found, it returns a status code 404.
    * */
    getChatRooms() {
        this.app.get('/chat-rooms', (req, res) => {
            this.userProvider.getUserById(req.cookies.userId, (user, error) => {
                if(user) {
                    const userNickname = user.name;
                    const roomIds: number[] = Array.isArray(req.query.ids) ? req.query.ids.map(id => Number(id)) : [Number(req.query.ids)];
                    // const rooms = roomIds.map(roomId => this.chatRoomProvider.getModel(Number(roomId)));
                    this.chatRoomProvider.getChatRoomsByIds(roomIds, (rooms, _) => {
                        if (!rooms || rooms.length === 0) {
                            res.status(404);
                            res.send('No chat room found for current user');
                            return;
                        }
                        else if (rooms.length !== roomIds.length) {
                            res.status(404);
                            res.send('Invalid room id');
                            return;
                        }
                        // const rooms2 = rooms.map(room => this._attachPrivateMessage(room, userNickname));
                        //TODO test
                        this._attachPrivateMessage(rooms, userNickname, (newRooms, error) => {
                            if (error) {
                                res.status(404);
                                res.send(error);
                                return;
                            }
                            res.status(200);
                            res.send(JSON.stringify(newRooms));
                        })
                    });
                } else {
                    res.status(403);
                    res.send("You need to be logged in");
                }
            });

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
               // const newRoom = this.chatRoomProvider.createModel(room);
               this.chatRoomProvider.createChatRoom(room, (newRoom, error) => {
                   if (!error && newRoom !== undefined) {
                       user.chatRooms.push(newRoom.id);
                       res.status(200);
                       res.send(JSON.stringify(newRoom));
                   } else {
                       res.status(500);
                       res.send("Error while creating chat room");
                   }
               })
               /*this.userProvider.updateUser(user, (updatedUser, error) => {
                   if(!error && updatedUser !== undefined) {
                       res.status(200);
                       res.send(JSON.stringify(newRoom));
                   } else {
                       res.status(500);
                       res.send("Error while updating the user");
                   }
               });*/
           });
        });
    }

    /*
    * Attaches the private messages to the chat room.
    * */
    _attachPrivateMessage(rooms: ChatRoom[], userNickname: string, callback: (newRooms: ChatRoom[], error) => void) {
        this.privateMessageProvider.getPrivateMessagesByRoomsId(rooms.map(r=>r.id), (result: any, error) => {
            if(error) {
                callback(undefined, error);
                return;
            } else if (result === undefined) {
                callback(rooms);
                return;
            }
            callback(rooms.map( room => {
                const messages = result[room.id];
                if (!messages) return room;
                const filteredMessages = messages.filter(message =>
                    message.userName === userNickname || message.nicknames.find(nickname => nickname === userNickname));
                const clonedRoom: ChatRoom = JSON.parse(JSON.stringify(room));
                clonedRoom.messages.push(...filteredMessages);
                return clonedRoom;
            }))
        });
    }
}

module.exports = ChatRoomController;
