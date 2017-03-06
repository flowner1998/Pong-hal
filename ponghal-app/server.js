var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.get('/arduino-player-1.html', function(req, res){
    res.sendfile('arduino-player-1.html');
    var data = true;
    io.emit('start ball', data);
});
app.get('/arduino-player-2.html', function(req, res){
    res.sendfile('arduino-player-2.html');
    var data = true;
    io.emit('start ball', data);
});
app.get('/', function(req, res){
	res.sendfile('index.html');
});

app.get('/player-1', function(req, res){
    res.sendfile('player-1.html');
});
app.get('/player-2', function(req, res){
    res.sendfile('player-2.html');
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){

  });

    socket.on('player 1 touch', function (data) {
        console.log('player 1 touch: ' + data);
        io.emit('player 1 touch', data);
    });
    socket.on('player 2 touch', function (data) {
        console.log('player 2 touch: ' + data);
        io.emit('player 2 touch', data);
    });
    socket.on('player1 up', function (data) {
        console.log('player1 up: ' + data);
        io.emit('player1 up', data);
    });
    socket.on('player1 down', function (data) {
        console.log('player1 down: ' + data);
        io.emit('player1 down', data);
    });
    socket.on('player2 up', function (data) {
        console.log('player2 up: ' + data);
        io.emit('player2 up', data);
    });
    socket.on('player2 down', function (data) {
        console.log('player2 down: ' + data);
        io.emit('player2 down', data);
    });

});

server.listen(300, function(){
	console.log('listening on *:300');
});