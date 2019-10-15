const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/frontend/'));
app.use(express.static(__dirname + '/frontend/views'));

const Provider = require('./backend/providers/provider.js');
const userController = new (require('./backend/controllers/user_controller.js'))(app, Provider, __dirname);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/views/chat/index.html');
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
