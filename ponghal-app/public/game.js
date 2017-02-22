//Global Variables
var windowWidth = window.innerWidth,
    windowHeight= window.innerHeight,
    canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d'),
    player1 = new Paddle(1, windowWidth / 4),
    player2 = new Paddle(2, (windowWidth / 4) * 3),
    running = false,
    startingPlayer = Math.floor(Math.random()*2 + 1);
    socket = io.connect();

//Function to create the canvas
function createCanvas(){
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,windowWidth,windowHeight);

    drawNet();
}

function drawNet () {
    var netWidth = 5;
    var netHeight = 30;
    ctx.fillStyle = '#ffffff';

    for (var i = 0; i < 15; i++) {
        ctx.fillRect(windowWidth / 2, i * (netHeight * 2), netWidth, netHeight);
    }
}

//Prototype Object for the paddle
function Paddle(player, scorePositionX){
    this.player = player;
    this.paddleHeight = 100;
    this.paddleWidth = 10;
    this.posX = (this.player == 1) ? 10 : windowWidth - 10 - this.paddleWidth;
    this.posY = windowHeight/2 - this.paddleHeight;
    this.velY = 5;
    this.isMovingDown = false;
    this.isMovingUp = false;
    this.score = 0;
    this.scorePositionX = scorePositionX;

    this.resetPaddle = function(){
        this.posY = windowHeight/2 - this.paddleHeight;
    };
    this.checkBoundary = function(){
        if(this.posY <= 0){
            this.posY = 0;
        }
        if(this.posY >= windowHeight - this.paddleHeight){
            this.posY = windowHeight - this.paddleHeight;
        }
    };

    this.drawPaddle = function(){
        if (this.isMovingDown) {
            this.posY += this.velY;
        }
        if (this.isMovingUp) {
            this.posY -= this.velY;
        }
        this.checkBoundary();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.posX, this.posY, this.paddleWidth, this.paddleHeight);
    };

    this.drawScore = function () {
        ctx.font = "50px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText(this.score, scorePositionX, 150);
    }
}

//object for the ball
var ball = {
    radius: 5,
    posX: 40,
    posY: 40,
    velX: 3,
    velY: 5,
    start: function(){
        var yVelocity = Math.floor(Math.random() * 3) + 1;
        if(this.posX < windowWidth){
            this.velX = 3;
            this.velY = yVelocity;
        }else{
            this.velX = -3;
            this.velY = yVelocity;
        }
    },
    checkCollisionWall: function(){
        if((this.posY > (windowHeight - this.radius*2)) || this.posY < this.radius*2){return true;}else{return false;}},
    checkColissionPaddle: function(p1, p2){
        if(this.posX <= p1.posX + p1.paddleWidth && this.posY > p1.posY && this.posY < p1.posY + p1.paddleHeight){
            this.velX *= 1.1;
            return true;
        }else if(this.posX >= p2.posX && this.posY > p2.posY && this.posY < p2.posY + p2.paddleHeight){
            this.velX *= 1.1;
            return true;
        }else{
            return false;
        }
    },
    updateBall: function(){
        if(this.checkCollisionWall()){
            this.velY *= -1;
        }
        if(this.checkColissionPaddle(player1,player2)){
            this.velX *= -1;
        }
        this.posX += this.velX;
        this.posY += this.velY;

    },
    drawBall: function(){
        this.updateBall();
        ctx.fillStyle = '#FFFFFF';
        ctx.arc(this.posX,this.posY, this.radius,0,Math.PI*2,false);
        ctx.fill();
    }
};


function redraw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createCanvas();
    player1.drawPaddle();
    player1.drawScore();
    player2.drawPaddle();
    player2.drawScore();
    ball.drawBall();
}
function resetGame(loserPlayer){
    running = false;
    player1.resetPaddle(); player2.resetPaddle();
    ball.velX = ball.velY = 0;
    if(loserPlayer == 1){
        ball.posX = player1.posX + player1.paddleWidth;
        ball.posY = player1.posY + player1.paddleHeight/2;
    }else{
        ball.posX = player2.posX - ball.radius*2;
        ball.posY = player2.posY + player2.paddleHeight/2;
    }
}
function checkGameOver(){
    if(ball.posX < 0){
        //Add point to player 2
        resetGame(1);
        player2.score += 1;
    }
    if(ball.posX > windowWidth - ball.radius * 2){
        //Add point to player 1
        resetGame(2)
        player1.score += 1;
        resetGame(2);
    }
}

//main Program
//LISTENING TO SOCKET INPUT
socket.on('player1 down', function(data){
    player1.isMovingDown = (data && !player1.isMovingDown) ? true : false;
});
socket.on('player2 down', function(data){
    player2.isMovingDown = (data && !player2.isMovingDown) ? true : false;
});
socket.on('player1 up', function(data){
    player1.isMovingUp = (data && !player1.isMovingUp) ? true : false;
});
socket.on('player2 up', function(data){
    player2.isMovingUp = (data && !player2.isMovingUp) ? true : false;
});

//#######################DEBUG#########################
$(document).keydown(function(e){
    if(e.keyCode == 32 && !running){
        ball.start();
    }
});

setInterval(function(){
    redraw();
    checkGameOver();
},1000/60);