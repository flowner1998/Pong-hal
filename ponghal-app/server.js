/**
 *
 * Server sided node.js for the ponghal-app
 * Contributors: Joey Hoogerwerf, Floris van Maldegem, Teun van Lingen, Chelsea Kauffeld
 *
 */
/*##################################################################################*/
/**
 * Including Node Package Modules
 * !REQUIRED ON FOLDER IS "npm install" & "npm install johnny-five"!
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
//var five = require("jonny-five");//Including johnny-five module for the Arduino compatibility

/**
 * Server sending files to a client
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.get('/arduino', function(){
    res.sendFile('arduino-start.html', {root: __dirname});
});

app.post('/arduino',function(){
    res.sendFile('arduino-start', {root: __dirname});
    var data = true;
    io.emit('start ball', data);
});

app.get('/arduino-player-1.html', function(req, res){
    res.sendfile('arduino-player-1.html', {root: __dirname});
    var data = true;
});
app.get('/arduino-player-2.html', function(req, res){
    res.sendfile('arduino-player-2.html', {root: __dirname});
    var data = true;
    io.emit('start ball', data);
});
app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname});
});

app.get('/player-1', function(req, res){
    res.sendFile('player-1.html', {root: __dirname});
});
app.get('/player-2', function(req, res){
    res.sendFile('player-2.html', {root: __dirname});
});



/**
 * Input Output system for javascript from players to index
 */

io.on('connection', function(socket){
  socket.on('disconnect', function(){

    });
    socket.on('start ball', function (data) {
        io.emit('start ball', data);
    });

    socket.on('player 1 connect', function (data) {
        io.emit('player 1 connect', data);
    });

    socket.on('player 1 disconnect', function () {
        io.emit('player 1 disconnect');
    });

    socket.on('player 1 touch', function (data) {
        console.log('player 1 touch: ' + data);
        io.emit('player 1 touch', data);
    });

    socket.on('player 2 connect', function (data) {
        io.emit('player 2 connect', data);
    });

    socket.on('player 2 disconnect', function () {
        io.emit('player 2 disconnect');
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