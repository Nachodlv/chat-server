require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const skipper = require('skipper');
const requestLib = require('request');
const bCrypt = require('bcrypt');

const local: boolean = process.argv[2] === 'local';
let io;
if (!local) {
    function requireHTTPS(req, res, next) {
        if (req.headers && (req.headers['x-forwarded-proto'] === 'https' || req.headers['x-forwarded-proto'] === 'wss')) {
            next();
            return;
        }
        console.log(req.headers);
        res.status(404);
        res.send('connection not secure');
    }

    app.use(requireHTTPS);

    const server = http.Server(app);
    server.listen(port, function () {
        console.log("listening on: " + port);
    });
    io = require('socket.io').listen(server);

} else {
    const server = https.createServer({
        key: fs.readFileSync('./certificates/key.pem'),
        cert: fs.readFileSync('./certificates/cert.pem'),
        passphrase: 'chatexample'
    }, app);
    server.listen(port);

    io = require('socket.io').listen(server);
    io.set('transports', ['websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
        'polling']);


    io.set('transports', ['websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
        'polling']);

}


app.use(bodyParser.json());
app.use(cookieParser());
app.use(skipper());
app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/frontend/views/'));

const Provider = require('./backend/providers/provider.js');
const UserProvider = require('./backend/providers/user_provider.js');
const User = require('./backend/models/user.js');
const Message = require('./backend/models/message.js');
const MessageType = require('./backend/models/message_type.js');
const ChatRoom = require('./backend/models/chat_room.js');

// INITIALIZATIONS
const dataBaseConnection = new (require('./database.js'))(requestLib);
const userProvider = new UserProvider(dataBaseConnection, User, requestLib);
const roomProvider = new Provider();
const privateMessagesProvider = new Provider();

const translatorService = new (require('./backend/services/translator_service.js'))(requestLib);
const encryptionService = new (require('./backend/services/encryption_service.js'))(bCrypt);

const userController = new (require('./backend/controllers/user_controller.js'))(app, userProvider, __dirname, requestLib, encryptionService);
const chatRoomController = new (require('./backend/controllers/chat_room_controller.js'))(app, roomProvider, userProvider, privateMessagesProvider, __dirname);

const chatWs = new (require('./backend/websockets/chat_ws.js'))(io, Message, roomProvider, translatorService);
const onlineWs = new (require('./backend/websockets/online_ws.js'))(io, userProvider, Message, MessageType, chatWs);
const chatFunctionsWs = new (require('./backend/websockets/chat_functions_ws.js'))(io, userProvider, roomProvider, Message, chatWs, MessageType);
const privateMessagesWs = new (require('./backend/websockets/private_messages_ws.js'))(io, privateMessagesProvider, roomProvider, translatorService);

