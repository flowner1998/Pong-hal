/**
 *
 * Server sided node.js for the ponghal-app
 * Contributors: Joey Hoogerwerf, Floris van Maldegem, Teun van Lingen, Chelsea Kauffeld
 *
 */
/*##################################################################################*/
/**
 * Including Node Package Modules
 * !REQUIRED ON FOLDER IS "npm install" and "npm install johnny-five"!
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");

/**
 * Server sending files to a client
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.get('/arduino', function(req, res){
    res.sendFile('arduino-start.html', {root: __dirname});
});

app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname});
});
app.get('/game', function(req, res){
    res.sendFile('game.html', {root: __dirname});
});
app.get('/highscores',function(req, res){
    res.sendFile('highscores.html', {root: __dirname});
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
        io.emit('player 1 touch', data);
    });

    socket.on('player 2 connect', function (data) {
        io.emit('player 2 connect', data);
    });

    socket.on('player 2 disconnect', function () {
        io.emit('player 2 disconnect');
    });

    socket.on('player 2 touch', function (data) {
        io.emit('player 2 touch', data);
    });
});

server.listen(300, function(){
	console.log('listening on *:300');
});

//arduino connection
var five = require("johnny-five"),
    board, button;

board = new five.Board();

board.on("ready", function() {
    button = new five.Button(2);
    board.repl.inject({
        button: button
    });

    button.on("down", function() {
        console.log("down");
        io.emit('start ball', true);
    });

});
