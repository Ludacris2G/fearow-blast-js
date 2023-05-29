const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.canvas.willReadFrequently = true;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// preloading the image for optimization purposes - if I load it in the explosion object, the first time a fearow is shot it will take an extra second to load
const explosionImage = new Image();
explosionImage.src = './images/boom.png';

const collisionCanvas = document.getElementById('collision-canvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCtx.canvas.willReadFrequently = true;
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextFearow = 0;
let fearowInterval = 500;
let lastTime = 0;
let score = 0;
let gameOver = false;
const scoreFont = '50px Impact';
const gameOverFont = '50px Impact';
const clickFont = '20px Impact';


let fearows = [];
let explosions = [];

class Fearow {
    constructor() {
        this.image = new Image();
        this.image.src = './images/fearow2.png';
        this.sizeModifier = Math.random() * 1 + 0.7;
        this.spriteWidth = 102;
        this.spriteHeight = 83;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 0.5 + 1;
        this.directionY = Math.random() * 1 - 0.5;
        this.markedForDeletion = false;
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 60 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }
    update(deltatime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x + this.width < 0) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame === this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) 
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
        }
        if (this.x + this.width < 0) gameOver = true;
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 30);
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = explosionImage;
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = './sounds/boom.flac';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
        }
        if (this.frame > 5) this.markedForDeletion = true;
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}

let particles = [];
class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size*0.5 + Math.random() * 50 - 25;
        this.y = y + this.size*0.6 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScore() {
    ctx.textAlign = 'start';

    ctx.font = scoreFont;
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80);
}

function drawGameOver() {
    ctx.textAlign = 'center';
    
    // Game Over text
    ctx.fillStyle = 'black';
    ctx.font = gameOverFont;
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 + 5);
    
    // Click instruction text
    ctx.font = clickFont;
    ctx.fillStyle = 'black';
    ctx.fillText('Click anywhere to play again', canvas.width/2, canvas.height/2 + 70);
    ctx.fillStyle = 'white';
    ctx.fillText('Click anywhere to play again', canvas.width/2 + 3, canvas.height/2 + 73);
}


window.addEventListener('click', () => {
    if (gameOver) {
        resetGame();
        requestAnimationFrame(animate);
    }
});

function resetGame() {
    fearows = [];
    explosions = [];
    particles = [];
    gameOver = false;
    timeToNextFearow = 0;
    fearowInterval = 500;
    lastTime = 0;
    score = 0;
}

window.addEventListener('click', function(e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    fearows.forEach((fearow) => {
        if (fearow.randomColors[0] === pc[0] && 
            fearow.randomColors[1] === pc[1] && 
            fearow.randomColors[2] === pc[2]) {
                fearow.markedForDeletion = true;
                score++;
                explosions.push(new Explosion(fearow.x, fearow.y, fearow.width));
            }
    })
})

function animate(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltatime = timeStamp - lastTime;
    lastTime = timeStamp;
    timeToNextFearow += deltatime;
    if (timeToNextFearow > fearowInterval) {
        fearows.push(new Fearow());
        timeToNextFearow = 0;
        fearows.sort((a, b) => {
            return a.width - b.width;
        });
    }
    drawScore();
    [...particles, ...fearows, ...explosions].forEach((object) => object.update(deltatime));
    [...particles, ...fearows, ...explosions].forEach((object) => object.draw());
    explosions = explosions.filter(explosion => !explosion.markedForDeletion);
    fearows = fearows.filter(fearow => !fearow.markedForDeletion);
    particles = particles.filter(particle => !particle.markedForDeletion);
    // console.log(fearows);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

resetGame(); 

animate(0);