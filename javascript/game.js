function paddle(){
    this.posX = 0;
    this.posY = 0;
    this.updatePos = function(x, y){
        this.posX = x;
        this.posY = y;
    };
    this.drawPaddle = function(){
        //draw the paddle
    };
}

var playerOne = new paddle();
console.log(playerOne.posX);