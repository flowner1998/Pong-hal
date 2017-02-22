//Global Variables
var windowWidth = window.innerWidth,
    windowHeight= window.innerHeight,
    canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d'),
    player1 = new Paddle(1),
    player2 = new Paddle(2),
    socket = io.connect();

//Function to create the canvas
function createCanvas(){
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,windowWidth,windowHeight);
}

//Prototype Object for the paddle
function Paddle(player){
    this.player = player;
    this.paddleHeight = 100;
    this.paddleWidth = 10;
    this.posX = (this.player == 1) ? 10 : windowWidth - 10 - this.paddleWidth;
    this.posY = 0;
    this.velY = 5;
    this.isMovingDown = false;

    this.drawPaddle = function(){

        if (this.isMovingDown) {
            this.posY += this.velY;
            // this.velY += 0.3;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.posX, this.posY, this.paddleWidth, this.paddleHeight);
    };


}

//object for the ball
var ball = {
    radius: 5,
    posX: 40,
    posY: 40,
    velX: 1,
    velY: 5,
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
    player2.drawPaddle();
    ball.drawBall();
}
function resetGame(){

}
function checkGameOver(){
    if(ball.posX<0 || ball.posX > windowWidth){
        resetGame();
    }
}

//main Program
//LISTENING TO SOCKET INPUT
socket.on('player1 down', function(data){
    if(data && !player1.isMovingDown){
        player1.isMovingDown = true;
    }else{
        player1.isMovingDown = false;
    }
});
setInterval(function(){
    redraw()
    checkGameOver();
},1000/60);