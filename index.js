
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const Provider = require("./public/providers/provider.js");

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/public/views'));

const userProvider = new Provider();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
   res.sendFile(__dirname + '/public/views/login/login.html');
});

app.post('/login', function (req, res) {
    const user = req.body;
    const result = userProvider.models.find((model) => model.name === user.name);
    if(result) {
        res.status(409);
        res.send('Nickname already in use');
        return;
    }
    const newUser = userProvider.createModel(user);
    res.status(200);
    res.send(JSON.stringify(newUser));
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
