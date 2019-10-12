// import {Provider} from "./providers/provider";
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public/views'));
app.use(express.static(__dirname + '/public'));

// const userProvider = new Provider();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
   res.sendFile(__dirname + '/public/views/login/login.html');
});

app.post('/login', function (req, res) {
    console.log(req.body);
    res.status(200);
    res.send('Ok');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
