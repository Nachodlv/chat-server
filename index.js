const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/frontend/views/'));

const Provider = require('./backend/providers/provider.js');
const User = require('./backend/models/user.js');
const Message = require('./backend/models/message.js');
const MessageType = require('./backend/models/message_type.js');
const ChatRoom = require('./backend/models/chat_room.js');

// INITIALIZATIONS
const userProvider = new Provider();
const roomProvider = new Provider();
const chatRoom = new ChatRoom('Everyone is invited!', 0);
roomProvider.createModel(chatRoom);
const gianni = new User('Gianni');
gianni.chatRooms.push(0);
userProvider.createModel(gianni);

const userController = new (require('./backend/controllers/user_controller.js'))(app, userProvider, __dirname);
const chatRoomController = new (require('./backend/controllers/chat_room_controller.js'))(app, roomProvider, userProvider, __dirname);

const chatWs = new (require('./backend/websockets/chat_ws.js'))(io, Message, roomProvider);
const onlineWs = new (require('./backend/websockets/online_ws'))(io, userProvider, chatWs, Message, MessageType);


// io.on('connection', function (socket) {
//     socket.on('chat message', function (msg) {
//         io.emit('chat message', msg);
//     });
// });

http.listen(port, function () {
    console.log('listening on *:' + port);
});
