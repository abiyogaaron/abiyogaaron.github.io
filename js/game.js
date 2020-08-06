var GameScreen = {
    canvas: document.createElement('canvas'),
    start: function() {
        var gameWrapper = document.getElementById('game-wrapper');
        this.canvas.width =  gameWrapper.clientWidth;
        this.canvas.height = 350;
        this.canvas.className = 'game-area';
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameScreen, 20);
        this.characterRunning = setInterval(running, 150);
        this.characterRunningCtr = 1;

        gameWrapper.insertBefore(this.canvas, gameWrapper.childNodes[0]);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
    }
}
var Character = null;

function component(width, height, srcImage, x, y){
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;  
    this.x = x;
    this.y = y;
    this.gravity = 0.9;
    this.gravitySpeed = 0;
    this.image = new Image();
    this.image.src = srcImage;

    this.update = function(){
        ctx = GameScreen.context;
        ctx.drawImage(
            this.image, 
            this.x, 
            this.y,
            this.width, 
            this.height
        );
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.checkPosition();
        this.hitBottom();
        this.hitTop();
    }
    this.hitBottom = function() {
        var rockbottom = (GameScreen.canvas.height - 50) - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    this.hitTop = function(){
        var skyTop = 0 + (this.height / 4);
        if(this.y <= skyTop){
            this.y = skyTop;
            this.gravitySpeed = 0;
            accelerateDown(0.2);
        }
    }
    this.checkPosition = function(){
        var jumpHeight = this.height + (this.y / 4);
        var rockbottom = (GameScreen.canvas.height - 50) - this.height;
        
        if(this.y <= rockbottom){
            if(this.y > rockbottom && this.y + 50 > rockbottom && this.y - 50 <= jumpHeight){
                this.image.src = "./assets/img/dino-jump/jump_4.png"
            }else if(this.y <= jumpHeight){
                this.image.src = "./assets/img/dino-jump/jump_6.png"
            }
        }
    }
    this.updateSpriteRunning = function(){
        var ctr = GameScreen.characterRunningCtr;
        if(ctr< 8){
            ctr = ctr + 1;
        }else if(ctr == 8){
            ctr = 1;
        }
        var rockbottom = (GameScreen.canvas.height - 50) - this.height;
        if(this.y == rockbottom) {
            this.image.src = `./assets/img/dino-run/run_${ctr}.png`;
            GameScreen.characterRunningCtr = ctr;
        }
    }
}

function running(){
    Character.updateSpriteRunning();
    Character.update();
}

function updateGameScreen(){
    GameScreen.clear();
    Character.newPos();
    Character.update();
}

function accelerate(n) {
    var rockbottom = (GameScreen.canvas.height - 50) - Character.height;
    var jumpHeight = Character.height + (Character.y / 4);
    if(Character.y >= rockbottom){
        Character.gravity = n;
        Character.image.src = "./assets/img/dino-jump/jump_2.png";
    }else if(Character.y == jumpHeight){
        accelerateDown(0.2)
    }
}

function accelerateDown(n){
    Character.gravity = n;
}

function startGame(){
    GameScreen.start();
    if(!Character){
        Character = new component(170, 118, "", 10, 180);
    }
}