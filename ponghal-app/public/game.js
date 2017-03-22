//Global Variables
var windowWidth = window.innerWidth,
    windowHeight = window.innerHeight,
    canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d'),
    player1 = new Paddle(1, windowWidth / 4),
    player2 = new Paddle(2, (windowWidth / 4) * 3),
    running = false,
    winScore = 5,
    winner = null,
    startingPlayer = Math.floor(Math.random()*2 + 1);
    socket = io.connect();

/**
 * Creates canvas
 * It sets the width and height of the canvas
 * it draws scores, names and the net.
 */
function createCanvas(){
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    drawNet();
}

/**
 * Function that draws the net
 */
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

/**
 * Object for the ball
 *
 */
var ball = {
    radius: 5, //radius of the ball (in pixels)
    posX: 0, //x Coordinate (in pixels)
    posY: 0, //y Coordinate (in pixels)
    velX: 0, //Velocity along the x-axis (in pixels per frame)
    velY: 0, //Velocity along the y-axis (in pixels per frame)
    direction: 0, //Current direction the ball is going (either 1 or -1)
    speedMultiplier: 1.1, //Variable stored to make the ball slower or faster
    speedCap: 30, //Maximum speed (in pixels per frame)
    bounceAngle: [-4,-3.5,-3,-2,-1,1,2,3,3.5,4], //Array stored to return a bounce angle dependent on where the ball hit the paddle
    /**
     * Fuction to Reset the position of the ball and sets the direction
     */
    start: function(){
        this.direction = (startingPlayer == 1) ? 1 : -1;
        this.posX = windowWidth/2 + this.radius/2;
        this.posY = windowHeight/2 - this.radius/2;
    },

    /**
     * Function to give the ball velocity after the start button is pressed
     */
    startBall: function(){
        var yVelocity = 0;
        while(yVelocity  == 0){
            yVelocity = Math.floor(Math.random() * 6) -2;
        }
        this.velX = 5 * this.direction;
        this.velY = yVelocity;
        running = true;
    },

    /**
     * Function to check if there is collision with the ceiling or floor
     */
    checkCollisionWall: function(){
        return((this.posY > (windowHeight - this.radius*2)) || this.posY < this.radius*2)
    },

    /**
     * Function to check collision with the paddles
     * @param p1 {object} player 1
     * @param p2 {object} player 2
     * @returns {boolean}
     */
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

    /**
     * Function to call every frame
     * Does all the logic for the ball
     */
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

    /**
     * Function to draw the ball on the canvas
     */
    drawBall: function(){
        this.updateBall();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.arc(this.posX,this.posY, this.radius,0,Math.PI*2,false);
        ctx.fill();
        ctx.stroke();
    }
};

/**
 * Object for the Paddles
 * @param player {number}
 * @param scorePositionX {number}
 * @constructor
 */
function Paddle(player, scorePositionX){
    this.player = player; //Player that controls the paddle
    this.name = ""; //Name assigned to the paddle
    this.fbId = 0; //Facebook ID of the player
    this.country = ""; //Country of the player
    this.paddleHeight = 100; //height of the paddle (in pixels)
    this.paddleWidth = 15; //width of the paddle (in pixels)
    this.posX = (this.player == 1) ? 10 : windowWidth - 10 - this.paddleWidth; //x coordinate of the paddle (in pixels)
    this.posY = windowHeight/2 - this.paddleHeight/2; // y Coordinate of the paddle (in pixels)
    this.velY = 5; //Velocity along the y-axis (in pixels per second) DEPRECATED
    this.isMovingDown = false; //DEPRECATED
    this.isMovingUp = false;//DEEPRECATED
    this.score = 0; //Current score of the player
    this.paddleSegmentHeight = this.paddleHeight/10; //The height of a single bounce segment from the paddle
    this.scorePositionX = scorePositionX; //X position to draw the score on
    this.maxMovementPerInterval = 5; //Maximum movement per frame (needs fixing, might just do that controller sided)
    this.posYLastInterval = this.posY; //Position last frame
    this.ballWasHit = false; // To avoid ball bouncing inside of the paddle

    /**
     * Function to return the angle of the ball to bounce back with
     * @returns {number}
     */
    this.returnBounceAngle = function(){
        for(var i = 0, height = this.paddleSegmentHeight; i < 10; i++, height+=this.paddleSegmentHeight){
            if(ball.posY >= (this.posY + height - this.paddleSegmentHeight) && ball.posY <= (this.posY + height)){
                return ball.bounceAngle[i] * (1 + Math.abs(ball.velX)/10);
            }
        }
        console.log('critical error, could not calculate bounce angle');
    };

    /**
     * Function to reset paddle position and ball Hit
     */
    this.resetPaddle = function(){
        this.posY = windowHeight/2 - this.paddleHeight/2;
        this.ballWasHit = false;
    };

    /**
     * Function to prevent the paddle from going out of bounds
     */
    this.checkBoundary = function(){
        if(this.posY <= 0){
            this.posY = 0;
        }
        if(this.posY >= windowHeight - this.paddleHeight){
            this.posY = windowHeight - this.paddleHeight;
        }
    };

    /**
     * Function to move the paddle
     * @param cursorPos
     */
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

    /**
     * Function to draw the paddle on screen
     */
    this.drawPaddle = function(){
        /* -Deprecated use of moving the paddle up and down
        if (this.isMovingDown) {
            this.posY += this.velY;
        }
        if (this.isMovingUp) {
            this.posY -= this.velY;
        }
        */
        this.checkBoundary();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.posX, this.posY, this.paddleWidth, this.paddleHeight);
    };
    /**
     * Function to draw the players score on the screen
     */
    this.drawScore = function () {
        ctx.font = "60px squarefont";
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillText(this.score, this.scorePositionX - (ctx.measureText(this.score).width / 2), 150);
        ctx.strokeText(this.score, this.scorePositionX - (ctx.measureText(this.score).width / 2), 150);
    };
    /**
     * function to check if the player has won
     */
    this.checkWin = function() {
        if(this.score == winScore){
            winner = this.player;
        }
    };

    /**
     * Function to draw the players name on the screen
     */
    this.drawName = function () {
        ctx.font = "40px squarefont";
        ctx.fillStyle = 'white';
        ctx.fillText(this.name, this.scorePositionX - (ctx.measureText(this.name).width / 2), 70);
    }
}

/**
 * Function to draw the whole game
 */
function redrawGame(){
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

/**
 * function to reset the ball and paddle
 * @param loserPlayer {number}
 */
function resetGame(loserPlayer){
    running = false;
    player1.resetPaddle();
    player2.resetPaddle();
    ball.velX = ball.velY = 0;
    startingPlayer = loserPlayer;

}

/**
 * Function to check if a point is over
 */
function checkPointOver(){
    if(ball.posX < 0 - ball.radius){
        //Add point to player 2
        resetGame(1);
        player2.score += 1;
        player2.checkWin();
    }
    if(ball.posX > windowWidth){
        //Add point to player 1
        resetGame(2);
        player1.score += 1;
        player1.checkWin();
    }
    checkGameOver();
}

/**
 * Function to check if the game is over
 */
function checkGameOver(){
    if(winner != null){
        switch(winner){
            case 1:
                //AJAX Call for winner = player 1
                redrawWinner(player1);
                break;

            case 2:
                //AJAX Call for winner = player 2
                redrawWinner(player2);
                break;
        }
        setTimeout(function(){
            var protocol = location.protocol;
            var port = location.port ? location.port : "";
            var host = protocol + "//" +  window.location.hostname + ":" + port;
            var page = "";
            window.location = host + "/" + page;
        }, 5000);

    }
}

/**
 * Function that draws the winner on the screen
 * @param po {object}
 */
function redrawWinner(po){
    var winnerString = "The winner is: player " + po.player;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "60px squarefont";
    ctx.fillStyle = 'white';
    ctx.fillText(winnerString, windowWidth/2 - (ctx.measureText(winnerString).width / 2), windowHeight/2);
}
//main Program
//LISTENING TO SOCKET INPUT

//DEPRECATED button technique
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
    if(winner == null){
        redrawGame();
        checkPointOver();
    }
},1000/60);

/**
 * SOCKET IO
 */
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

socket.on('player 1 connect', function(data){
    player1.name = data.name;
    player1.fbId = data.fbId;
    player1.country = data.country;
});

socket.on('player 1 disconnect', function(){
    player1.name = "";
    player1.posY = windowHeight/2 - player1.paddleHeight/2;
});

socket.on('player 2 connect', function(data){
    player1.name = data.name;
    player1.fbId = data.fbId;
    player1.country = data.country;
});

socket.on('player 2 disconnect', function(){
    player2.name = "";
    player2.posY = windowHeight/2 - player2.paddleHeight/2;
});