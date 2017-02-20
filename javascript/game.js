function ball(){
    this.posX = 0;
    this.posY = 0;
    this.speed = 10;
    this.updatePos = function(x, y){
        this.posX = x;
        this.posY = y;
    };
    this.drawBall = function(){
        //Draw Ball
    }
}