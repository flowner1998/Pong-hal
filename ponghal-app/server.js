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

var players = [false, false];

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
    if(players[0]){
        res.sendFile('playerTaken.html', {root: __dirname});
    }else{
        res.sendFile('player-1.html', {root: __dirname});
    }
});

app.get('/player-2', function(req, res){
    if(players[1]){
        res.sendFile('playerTaken.html', {root: __dirname});
    }else{
        res.sendFile('player-2.html', {root: __dirname});
    }
});

app.get('/privacy', function(req, res){
    res.sendFile('privacypolicy.htm', {root: __dirname});
});

app.get('/reset', function(req, res){
    players[0] = false;
    players[1] = false;
    res.sendFile('playerTaken.html', {root: __dirname});
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
        players[0] = true;
        console.log('player1 conn');
        if(players[0] && players[1]){
            io.emit('start game', true);
        }
        setTimeout(function(){
            io.emit('player 1 connect', data);
        },1000);
    });

    socket.on('player 1 disconnect', function () {
        players[0] = false;
        io.emit('player 1 disconnect');
    });

    socket.on('player 1 touch', function (data) {
        io.emit('player 1 touch', data);
    });

    socket.on('player 2 connect', function (data) {
        players[1] = true;
        if(players[0] && players[1]){
            io.emit('start game', true);
        }
        setTimeout(function(){
            io.emit('player 2 connect', data);
        },1000);
    });

    socket.on('player 2 disconnect', function () {
        players[1] = false;
        io.emit('player 2 disconnect');
    });

    socket.on('player 2 touch', function (data) {
        io.emit('player 2 touch', data);
    });
});

server.listen(300, function(){
	console.log('listening on *:300');
});


// arduino connection
// var five = require("johnny-five"),
//     board, button;
//
// board = new five.Board();
//
// board.on("ready", function() {
//     button = new five.Button(2);
//     board.repl.inject({
//         button: button
//     });
//
//     button.on("down", function() {
//         console.log("down");
//         io.emit('start ball', true);
//     });
//
// });
