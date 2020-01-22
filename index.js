require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const skipper = require('skipper');
const requestLib = require('request');
const bCrypt = require('bcrypt');
const session = require('express-session');

const port = process.argv[3]? process.argv[3].split('--port=')[1] : process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());
app.options('*', cors());


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


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(fileUpload({
    limits: {
        fileSize: 1 * 1024 * 1024,
        fields: 50,
        files: 1,
        parts: 51,
    }
}));
app.use(cookieParser());
app.use(skipper());
app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/frontend/views/'));
app.use(require('helmet')());

const redisSocket = require('socket.io-redis');
io.adapter(redisSocket({ host: '184.172.214.68', port: 31011 }));


app.use(session({
    secret: 'ch@4tr00m',
    name: 'jsessionid',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const Provider = require('./backend/providers/provider.js');
const UserProvider = require('./backend/providers/user_provider.js');
const ChatRoomProvider = require('./backend/providers/chat_room_provider.js');
const PrivateMessageProvider = require('./backend/providers/private_message_provider.js');
const User = require('./backend/models/user.js');
const Message = require('./backend/models/message.js');
const FileMessage = require('./backend/models/file_message.js');
const PrivateMessage = require('./backend/models/private_message.js');
const PrivateFileMessage = require('./backend/models/private_file_message.js');
const MessageType = require('./backend/models/message_type.js');
const ChatRoom = require('./backend/models/chat_room.js');

// INITIALIZATIONS
const dataBaseConnection = new (require('./database.js'))(requestLib);
const translatorService = new (require('./backend/services/translator_service.js'))(requestLib);
const encryptionService = new (require('./backend/services/encryption_service.js'))(bCrypt);
const OBJSTORAGECRED = require('../certificates/object_storage_credentials.json');
const IBMCOS = require('ibm-cos-sdk');
const rp = require('request-promise');
const objectStorageService = new (require('./backend/services/object_storage_service.js'))(OBJSTORAGECRED, IBMCOS, rp, encryptionService);

dataBaseConnection.connect((token, _) => {
    const authHeader = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
    const db2Service = new (require('./backend/services/db2_service.js'))(authHeader, requestLib);

    const userProvider = new UserProvider(User, db2Service);
    const roomProvider = new ChatRoomProvider(ChatRoom, User, Message, FileMessage, MessageType, db2Service);
    const privateMessageProvider = new PrivateMessageProvider(PrivateMessage, PrivateFileMessage, MessageType, db2Service);

    const userController = new (require('./backend/controllers/user_controller.js'))(app, userProvider, __dirname, requestLib, objectStorageService, encryptionService, fs);
    const chatRoomController = new (require('./backend/controllers/chat_room_controller.js'))(app, roomProvider, userProvider, privateMessageProvider, __dirname);
    const idController = new(require('./backend/controllers/id_controller.js'))(app);

    const chatWs = new (require('./backend/websockets/chat_ws.js'))(io, Message, MessageType, roomProvider, objectStorageService, translatorService);
    const onlineWs = new (require('./backend/websockets/online_ws.js'))(io, userProvider, Message, MessageType, chatWs);
    const chatFunctionsWs = new (require('./backend/websockets/chat_functions_ws.js'))(io, userProvider, roomProvider, Message, chatWs, MessageType);
    const privateMessagesWs = new (require('./backend/websockets/private_messages_ws.js'))(io, MessageType, privateMessageProvider, roomProvider, objectStorageService, translatorService);
});



