var Character = null;
var Obstacles = [];
var maxObstacleNumber = 3;
var maxLife = 3;
var GameScreen = {
    canvas: document.createElement('canvas'),
    gameWrapper: document.getElementById('game-wrapper'),
    gameScores: 0,
    obstacleList: [
        {
            name: "stone",
            src: './assets/img/obstacles/stone_img.png',
            width: 90,
            height: 54,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 235,
            collisionleft: 85,
            collisionRight: 85,
            collisionTop: 20,
            collisionBot: 20
        },
        {
            name: "crate",
            src: "./assets/img/obstacles/crate_img.png",
            width: 77,
            height: 77,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 220,
            collisionleft: 60,
            collisionRight: 60,
            collisionTop: 0,
            collisionBot: 0
        },
        {
            name: "tree",
            src: "./assets/img/obstacles/tree_img.png",
            width: 91,
            height: 87.5,
            x: document.getElementById('game-wrapper').clientWidth,
            y: 200,
            collisionleft: 65,
            collisionRight: 65,
            collisionTop: 20,
            collisionBot: 20
        }
    ],
    load: function() {
        this.canvas.width =  this.gameWrapper.clientWidth;
        this.canvas.height = 350;
        this.canvas.className = 'game-area';
        this.context = this.canvas.getContext("2d");
        this.gameWrapper.insertBefore(this.canvas, this.gameWrapper.childNodes[0]);
        this.gameScores = 0;
        this.isRetry = false;
    },
    start: function() {
        if(this.isRetry){
            this.clear();
            var gameArea = document.getElementsByClassName('game-area');
            gameArea[0].classList.remove('game-area-stop');

            Character.life = maxLife;
            this.gameScores = 0;

            Obstacles = [];
            initObstacles();
        }

        this.interval = setInterval(updateGameScreen, 20);
        this.characterRunning = setInterval(running, 150);
        this.characterRunningCtr = 1;

        var gameArea = document.getElementsByClassName('game-area');
        gameArea[0].classList.add('game-area-run');

        document.getElementById('jump-btn').classList.remove('hidden');
        document.getElementById('score-text').classList.remove('hidden');
        document.getElementById('life-icon').classList.remove('hidden');
        document.getElementById('play-me-btn').classList.add('hidden');
        document.getElementById('score').innerText = this.gameScores;

        this.renderHeart(Character.life);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        clearInterval(this.characterRunning);
        this.isRetry = true;
        
        var gameArea = document.getElementsByClassName('game-area');
        gameArea[0].classList.add('game-area-stop');

        document.getElementById('jump-btn').classList.add('hidden');
        document.getElementById('play-me-btn').classList.remove('hidden');

        this.characterDeadCtr = 1;
        setInterval(function(){
            var ctr = GameScreen.characterDeadCtr;
            if(ctr < 8){
                ctr = ctr + 1;
                GameScreen.clear();
                Character.update();
                Character.runDeadSprite(ctr);  
            }else if(ctr == 8){
                GameScreen.clearDeadInterval();
            }
        }, 100);
    },
    getObstacle: function(idx){
        return this.obstacleList[idx];
    },
    getCountObstacles: function(){
        return this.obstacleList.length;
    },
    setGameScore: function(){
        this.gameScores += 50;
        document.getElementById('score').innerText = this.gameScores;
    },
    getGameScore: function(){
        return this.gameScores;
    },
    renderHeart: function(life){
        document.getElementById('life-icon').innerHTML = ''
        var deadLife = maxLife - life;
        for(var i=0; i<life; i++){
            document.getElementById('life-icon').innerHTML += '<i class="fas fa-heart fa-2x"></i>'
        }
        for(var i=0; i<deadLife; i++){
            document.getElementById('life-icon').innerHTML += '<i class="far fa-heart fa-2x"></i>'
        }
    },
    clearDeadInterval: function(){
        clearInterval(this.characterDead);
    }
}

function component(width, height, srcImage, x, y){
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;  
    this.x = x;
    this.y = y;
    this.life = maxLife;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.immunity = false;
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
    this.crashWith = function(otherobj) {
        if(this.immunity) return false;

        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x + otherobj.collisionleft;
        var otherright = (otherobj.x + (otherobj.width)) - otherobj.collisionRight;
        var othertop = otherobj.y + otherobj.collisionTop;
        var otherbottom = (otherobj.y + (otherobj.height)) - otherobj.collisionBot;
        var crash = true;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
          crash = false;
        }
        return crash;
    }
    this.setImmunity = function(immunity){
        this.immunity = immunity;
    }
    this.runDeadSprite = function(ctr){
        this.image.src = `./assets/img/dino-dead/dead_${ctr}.png`;
        GameScreen.characterDeadCtr = ctr;
    }
}

function ObstacleComponent(width, height, srcImage, x, y, collisionleft, collisionRight, collisionTop, collisionBot){
    this.width = width;
    this.height = height;
    this.speedX = 5;
    this.speedY = 5;  
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = srcImage;
    this.collisionleft = collisionleft;
    this.collisionRight = collisionRight;
    this.collisionTop = collisionTop;
    this.collisionBot = collisionBot;

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
        if(this.x <= (0 - this.width) && Obstacles.length === maxObstacleNumber){
            if(!Character.immunity){
                GameScreen.setGameScore();
            }
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
        Character.setImmunity(false);
    }
}

function checkGameStop(){
    if(Character.life === 1){
        GameScreen.stop();
        GameScreen.renderHeart(0);
    }else{
        Character.life = Character.life - 1;
        GameScreen.renderHeart(Character.life);
        Character.setImmunity(true);
    }
}

function running(){
    if(Character.crashWith(Obstacles[0])){
        checkGameStop();
    }else{
        Character.updateSpriteRunning();
    }
}
function updateGameScreen(){
    if(Character.crashWith(Obstacles[0])){
        checkGameStop();
    }else{
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
}

function accelerate(n) {
    var rockbottom = Character.getRockBottom();
    var jumpHeight = Character.getJumpHeight();
    if(Character.y >= rockbottom){
        Character.gravity = n;
        Character.image.src = "./assets/img/dino-jump/jump_2.png";
    }else if(Character.y == jumpHeight){
        accelerateDown(10)
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
        Math.floor((Math.random() * (obstacleObj.x * 1)) + obstacleObj.x), 
        obstacleObj.y,
        obstacleObj.collisionleft,
        obstacleObj.collisionRight,
        obstacleObj.collisionTop,
        obstacleObj.collisionBot
    );
    Obstacles.push(obs); 
}

function loadGame(){
    if(!Character){
        Character = new component(170, 118, "", 10, 180);
    }
    if(Obstacles.length == 0){
        initObstacles();
    }
   GameScreen.load();
}

function initObstacles(){
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
            obstacleObj.y,
            obstacleObj.collisionleft,
            obstacleObj.collisionRight,
            obstacleObj.collisionTop,
            obstacleObj.collisionBot
        );
        Obstacles.push(obs); 
    }
}

function runGame(){
    GameScreen.start();
}