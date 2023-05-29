const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collision-canvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextFearow = 0;
let fearowInterval = 500;
let lastTime = 0;
let score = 0;
ctx.font = '50px Impact';
// test
const test = 0;

let fearows = [];
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
        }
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 30);
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80);
}

window.addEventListener('click', function(e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    
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
    [...fearows].forEach((fearow) => fearow.update(deltatime));
    [...fearows].forEach((fearow) => fearow.draw());
    fearows = fearows.filter(fearow => !fearow.markedForDeletion);
    // console.log(fearows);
    requestAnimationFrame(animate);
}
animate(0);