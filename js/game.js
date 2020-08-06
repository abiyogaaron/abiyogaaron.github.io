var GameScreen = {
    canvas: document.createElement('canvas'),
    gameWrapper: document.getElementById('game-wrapper'),
    obstacleList: [
        {
            name: "stone",
            src: './assets/img/obstacles/Stone.png',
            width: 90,
            height: 54,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 235
        },
        {
            name: "crate",
            src: "./assets/img/obstacles/Crate.png",
            width: 77,
            height: 77,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 220
        },
        {
            name: "tree",
            src: "./assets/img/obstacles/tree.png",
            width: 141,
            height: 137.5,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 170
        }
    ],
    start: function() {
        this.canvas.width =  this.gameWrapper.clientWidth;
        this.canvas.height = 350;
        this.canvas.className = 'game-area';
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameScreen, 20);
        this.characterRunning = setInterval(running, 150);
        this.characterRunningCtr = 1;

        this.gameWrapper.insertBefore(this.canvas, this.gameWrapper.childNodes[0]);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
    },
    getObstacle: function(idx){
        return this.obstacleList[idx];
    },
    getCountObstacles: function(){
        return this.obstacleList.length;
    }
}
var Character = null;
var Obstacles = [];
var maxObstacleNumber = 3;

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

    this.getRockBottom = function(){
        return (GameScreen.canvas.height - 50) - this.height;
    }
    this.getSkyTop = function(){
        return 0;
    }
    this.getJumpHeight = function(){
        return this.height + (this.y / 8);
    }

    this.hitBottom = function() {
        var rockbottom = this.getRockBottom();
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    this.hitTop = function(){
        var skyTop = this.getSkyTop();
        if(this.y <= skyTop){
            this.y = skyTop;
            this.gravitySpeed = 0;
            accelerateDown(0.2);
        }
    }
    this.checkPosition = function(){
        var jumpHeight = this.getJumpHeight();
        var rockbottom = this.getRockBottom();
        
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
        var rockbottom = this.getRockBottom();
        if(this.y == rockbottom) {
            this.image.src = `./assets/img/dino-run/run_${ctr}.png`;
            GameScreen.characterRunningCtr = ctr;
        }
    }
}

function ObstacleComponent(width, height, srcImage, x, y){
    this.width = width;
    this.height = height;
    this.speedX = 3;
    this.speedY = 5;  
    this.x = x;
    this.y = y;
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
        this.x -= this.speedX;
        this.checkHitBoundaries();
    }
    this.checkHitBoundaries = function(){
        if(this.x <= (0 - this.width)){
            this.destroyer();
        }
        else if((GameScreen.canvas.width / 4) >= this.x){
            if(Obstacles.length < maxObstacleNumber){
                createObstacle();
            }
        }
    }
    this.destroyer = function(){
        Obstacles.shift();
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

    if(Obstacles.length > 0){
        for(var i=0; i<Obstacles.length; i++){
            Obstacles[i].newPos();
            Obstacles[i].update();
        }
    }
}

function accelerate(n) {
    var rockbottom = Character.getRockBottom();
    var jumpHeight = Character.getJumpHeight();
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

function createObstacle(){
    var obs;
    var elIdxRand = Math.floor(Math.random() * GameScreen.getCountObstacles());
    var obstacleObj = GameScreen.getObstacle(elIdxRand);

    obs = new ObstacleComponent(
        obstacleObj.width, 
        obstacleObj.height, 
        obstacleObj.src, 
        Math.floor((Math.random() * (obstacleObj.x * 1.5)) + obstacleObj.x), 
        obstacleObj.y
    );
    Obstacles.push(obs); 
}

function startGame(){
    if(!Character){
        Character = new component(170, 118, "", 10, 180);
    }
    if(Obstacles.length == 0){
        var obs;
        var elIdxRand = Math.floor(Math.random() * GameScreen.getCountObstacles());
        var obstacleObj = GameScreen.getObstacle(elIdxRand);

        for(var i=0 ; i<maxObstacleNumber; i++){
            var number = i+1;
            obs = new ObstacleComponent(
                obstacleObj.width, 
                obstacleObj.height, 
                obstacleObj.src, 
                obstacleObj.x + (number * 600), 
                obstacleObj.y
            );
            Obstacles.push(obs); 
        }
    }
    GameScreen.start();
}