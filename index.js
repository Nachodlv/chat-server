const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const requestLib = require('request');

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/frontend/views/'));


const server = https.createServer({
    key: fs.readFileSync('./certificates/key.pem'),
    cert: fs.readFileSync('./certificates/cert.pem'),
    passphrase: 'chatexample'
}, app);
server.listen(port);

const io = require('socket.io').listen(server);
io.set('transports', ['websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
    'polling']);

const Provider = require('./backend/providers/provider.js');
const User = require('./backend/models/user.js');
const Message = require('./backend/models/message.js');
const MessageType = require('./backend/models/message_type.js');
const ChatRoom = require('./backend/models/chat_room.js');

// INITIALIZATIONS
const userProvider = new Provider();
const roomProvider = new Provider();
const privateMessagesProvider = new Provider();

const userController = new (require('./backend/controllers/user_controller.js'))(app, userProvider, __dirname);
const chatRoomController = new (require('./backend/controllers/chat_room_controller.js'))(app, roomProvider, userProvider, privateMessagesProvider, __dirname);

const chatWs = new (require('./backend/websockets/chat_ws.js'))(io, Message, roomProvider, requestLib);
const onlineWs = new (require('./backend/websockets/online_ws.js'))(io, userProvider, Message, MessageType, chatWs);
const chatFunctionsWs = new (require('./backend/websockets/chat_functions_ws.js'))(io, userProvider, roomProvider, Message, chatWs, MessageType);
const privateMessagesWs = new (require('./backend/websockets/private_messages_ws.js'))(io, privateMessagesProvider, roomProvider);

