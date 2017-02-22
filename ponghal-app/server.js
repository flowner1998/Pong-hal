var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/player-1', function(req, res){
    res.sendfile('player-1.html');
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){

  });

    socket.on('player 1 movement', function (data) {
        console.log('player 1 movement: ' + data);
        io.emit('player 1 movement', data);
    });
});

server.listen(300, function(){
	console.log('listening on *:300');
});