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
const userProvider = new Provider();
const Message = require('./backend/models/message.js');
const userController = new (require('./backend/controllers/user_controller.js'))(app, userProvider, __dirname);
const chatWs = new (require('./backend/websockets/chat_ws.js'))(io, Message);
const onlineWs = new (require('./backend/websockets/online_ws'))(io, userProvider, chatWs, Message);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/views/chat/index.html');
});

app.get('/chat-list', function (req, res) {
   res.sendFile(__dirname + '/frontend/views/chat-list/chat_list.html')
});

// io.on('connection', function (socket) {
//     socket.on('chat message', function (msg) {
//         io.emit('chat message', msg);
//     });
// });

http.listen(port, function () {
    console.log('listening on *:' + port);
});
