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

    // calculate amount of net pieces needed to fill at least 50% of screen height
    var nrOfNetPieces = Math.ceil((windowHeight / 2) / netHeight);

    // calculate remainder white space
    var totalWhiteSpaceHeight = windowHeight - (nrOfNetPieces * netHeight);

    // calculate individual white space height. nr of white spaces is -1 net piece so our net always ends with a net piece
    var whiteSpaceHeight = totalWhiteSpaceHeight / (nrOfNetPieces - 1);

    ctx.fillStyle = '#ffffff';

    for (var i = 0; i < nrOfNetPieces; i++) {
        ctx.fillRect(windowWidth / 2, i * (netHeight + whiteSpaceHeight), netWidth, netHeight);
    }
}

//object for the ball
var ball = {
    radius: 5,
    posX: 0,
    posY: windowHeight/2,
    velX: 0,
    velY: 0,
    direction: 0,
    speedMultiplier: 1.1,
    speedCap: 30,
    bounceAngle: [-5,-4,-3,-2,-1,1,2,3,4,5],
    start: function(){
        switch(startingPlayer){
            case 1:
                this.posX = player1.posX + player1.paddleWidth + this.radius;
                this.posY = player1.posY + player1.paddleHeight/2 + this.radius;
                this.direction = 1;
                break;
            case 2:
                this.posX = player2.posX - this.radius;
                this.posY = player2.posY + player2.paddleHeight/2 + this.radius;
                this.direction = -1;
                break;
        }
    },
    startBall: function(){
        var yVelocity = 0;
        while(yVelocity  == 0){
            yVelocity = Math.floor(Math.random() * 6) -2;
        }

        this.velX = 5 * this.direction;
        this.velY = yVelocity;
        running = true;
    },
    checkCollisionWall: function(){
        return((this.posY > (windowHeight - this.radius*2)) || this.posY < this.radius*2)},
    checkCollisionPaddle: function(p1, p2){
        if(this.posX <= p1.posX + p1.paddleWidth && this.posY >= p1.posY && this.posY <= p1.posY + p1.paddleHeight && !p1.ballWasHit){
            this.velY = this.speedMultiplier * p1.returnBounceAngle();
            player1.ballWasHit = true;
            player2.ballWasHit = false;
            return true;
        }else if(this.posX >= p2.posX && this.posY > p2.posY && this.posY < p2.posY + p2.paddleHeight && !p2.ballWasHit){
            this.velY = this.speedMultiplier * p2.returnBounceAngle();
            player1.ballWasHit = false;
            player2.ballWasHit = true;
            return true;
        }else{
            return false;
        }

    },
    updateBall: function(){
        if(this.checkCollisionWall()){
            this.velY *= -1;
        }
        if(this.checkCollisionPaddle(player1,player2)){
            this.direction *= -1;
            this.velX = Math.abs(this.velX) * this.direction;
            if(Math.abs(this.velX) < this.speedCap){
                this.velX *= this.speedMultiplier;
            }else{
                this.velX = this.speedCap;
            }
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

//Prototype Object for the paddle
function Paddle(player, scorePositionX){
    this.player = player;
    this.name = "";
    this.paddleHeight = 100;
    this.paddleWidth = 15;
    this.posX = (this.player == 1) ? 10 : windowWidth - 10 - this.paddleWidth;
    this.posY = windowHeight/2 - this.paddleHeight/2;
    this.velY = 5;
    this.isMovingDown = false;
    this.isMovingUp = false;
    this.score = 0;
    this.paddleSegmentHeight = this.paddleHeight/10;
    this.scorePositionX = scorePositionX;
    this.maxMovementPerInterval = 5;
    this.posYLastInterval = this.posY;
    this.ballWasHit = false;
    this.returnBounceAngle = function(){
        for(var i = 0, height = this.paddleSegmentHeight; i < 10; i++, height+=this.paddleSegmentHeight){
            if(ball.posY >= (this.posY + height - this.paddleSegmentHeight) && ball.posY <= (this.posY + height)){
                return ball.bounceAngle[i];
            }
        }
        console.log('critical error, could not calculate bounce angle');
    };
    this.resetPaddle = function(){
        this.posY = windowHeight/2 - this.paddleHeight;
        this.ballWasHit = false;
    };
    this.checkBoundary = function(){
        if(this.posY <= 0){
            this.posY = 0;
        }
        if(this.posY >= windowHeight - this.paddleHeight){
            this.posY = windowHeight - this.paddleHeight;
        }
    };
    this.movePaddle = function(cursorPos){
        var movement =  cursorPos - this.posYLastInterval;
        if(Math.abs(movement) > this.maxMovementPerInterval){
            if(movement > 0){
                this.posY += this.maxMovementPerInterval;
            }else{
                this.posY -= this.maxMovementPerInterval;
            }
        }else{
            this.posY = cursorPos;
        }
        this.posYLastInterval = this.posY;
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
        ctx.font = "60px squarefont";
        ctx.fillStyle = 'white';
        ctx.fillText(this.score, this.scorePositionX - (ctx.measureText(this.score).width / 2), 150);
    }

    this.drawName = function () {
        ctx.font = "40px squarefont";
        ctx.fillStyle = 'white';
        ctx.fillText(this.name, this.scorePositionX - (ctx.measureText(this.name).width / 2), 70);
    }
}




function redraw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createCanvas();
    player1.drawPaddle();
    player1.drawScore();
    player1.drawName();
    player2.drawPaddle();
    player2.drawScore();
    player2.drawName();
    if(!running){
        ball.start();
    }
    ball.drawBall();
}
function resetGame(loserPlayer){
    running = false;
    player1.resetPaddle(); player2.resetPaddle();
    ball.velX = ball.velY = 0;
    if(loserPlayer == 1){
        ball.posX = player1.posX + player1.paddleWidth + ball.radius;
        ball.posY = player1.posY + player1.paddleHeight/2;
    }else{
        ball.posX = player2.posX - ball.radius;
        ball.posY = player2.posY + player2.paddleHeight/2;
    }
}
function checkGameOver(){
    if(ball.posX < 0 - ball.radius){
        //Add point to player 2
        resetGame(1);
        player2.score += 1;
    }
    if(ball.posX > windowWidth){
        //Add point to player 1
        resetGame(2);
        player1.score += 1;
    }
}

//main Program
//LISTENING TO SOCKET INPUT

//Old button technique
socket.on('player1 down', function(data){
    player1.isMovingDown = (data && !player1.isMovingDown);
});
socket.on('player2 down', function(data){
    player2.isMovingDown = (data && !player2.isMovingDown);
});
socket.on('player1 up', function(data){
    player1.isMovingUp = (data && !player1.isMovingUp);
});
socket.on('player2 up', function(data){
    player2.isMovingUp = (data && !player2.isMovingUp);
});




//New touch technique
// socket.on('player 1 touch', function(positionYPercentage){
//     player1.movePaddle(positionYPercentage * windowHeight);
// });
// socket.on('player 2 touch', function(positionYPercentage){
//     player2.posY = positionYPercentage * windowHeight;
// });
// socket.on('start ball', function(data){
//     if(data && !running){
//         ball.startBall();
//         socket.emit('start ball', false);
//     }
// });

//#######################DEBUG#########################
$(document).keydown(function(e){
    switch(e.keyCode){
        //space
        case 32:
            if(!running){
                ball.startBall();
            }
            break;

        //arrow up
        case 38:
            //paddle2 up
            player2.posY -= 20;
            break;

        //arrow down
        case 40:
            //paddle2 down
            player2.posY += 20;
            break;

        //keyboard W
        case 87:
            //paddle1 up
            player1.posY -= 20;
            break;

        //keyboard S
        case 83:
            //paddle1 down
            player1.posY += 20;
            break;
    }
});
ball.start();
setInterval(function(){
    socket.on('player 1 touch', function(data){
        player1.movePaddle(data.y * windowHeight);
    });
    socket.on('player 2 touch', function(data){
        player2.movePaddle(data.y * windowHeight);
    });
    socket.on('start ball', function(data){
        if(data && !running){
            ball.startBall();
            socket.emit('start ball', false);
        }
    });
    redraw();
    checkGameOver();
},1000/60);

socket.on('player 1 connect', function(data){
    player1.name = data.name;
});

socket.on('player 1 disconnect', function(){
    player1.name = "";
    player1.posY = windowHeight/2 - player1.paddleHeight/2;
});

socket.on('player 2 connect', function(data){
    player2.name = data.name;
    console.log("CONN" + data.name);
});

socket.on('player 2 disconnect', function(){
    player2.name = "";
    player2.posY = windowHeight/2 - player2.paddleHeight/2;
});