// Arkanoid v1.6 — адаптация под мобильные

let isRunning = false;
let isPaused = false;
let animationId;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Адаптивный размер канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Масштаб от базовой ширины (480px)
const scale = canvasWidth / 480;

let paddleWidth = 75 * scale;
const paddleHeight = 10 * scale;
let paddleX = (canvasWidth - paddleWidth) / 2;

let score = 0;
let level = 1;
const maxLevel = 3;

let rightPressed = false;
let leftPressed = false;

let balls = [
    { x: canvasWidth / 2, y: canvasHeight - 30, dx: 2 * scale, dy: -2 * scale, radius: 8 * scale }
];

let powerUps = [];
const powerUpWidth = 20 * scale;
const powerUpHeight = 20 * scale;
const powerUpChance = 0.3;

const blockRowCount = 5;
const blockColumnCount = 7;
const blockWidth = 55 * scale;
const blockHeight = 20 * scale;
const blockPadding = 10 * scale;
const blockOffsetTop = 30 * scale;
const blockOffsetLeft = 35 * scale;
let blocks = [];

for (let c = 0; c < blockColumnCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
        blocks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddleX = mouseX - paddleWidth / 2;
});

canvas.addEventListener("touchmove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    paddleX = touchX - paddleWidth / 2;
});

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
});

function drawPaddle() {
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(paddleX, canvasHeight - paddleHeight - 10 * scale, paddleWidth, paddleHeight);
}

function drawScore() {
    ctx.font = `${16 * scale}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Очки: " + score, 8 * scale, 20 * scale);
    ctx.fillText("Уровень: " + level, canvasWidth - 100 * scale, 20 * scale);
}

function drawPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        const p = powerUps[i];
        if (p.active) {
            if (p.type === "widen") ctx.fillStyle = "#00ff00";
            else if (p.type === "slow") ctx.fillStyle = "#00bfff";
            else if (p.type === "multiball") ctx.fillStyle = "#ff3366";

            ctx.fillRect(p.x, p.y, powerUpWidth, powerUpHeight);
            ctx.fillStyle = "#000";
            ctx.font = `bold ${12 * scale}px Arial`;
            ctx.fillText(p.type[0].toUpperCase(), p.x + 4 * scale, p.y + 15 * scale);

            p.y += 2 * scale;

            if (
                p.y + powerUpHeight >= canvasHeight - paddleHeight - 10 * scale &&
                p.x + powerUpWidth > paddleX &&
                p.x < paddleX + paddleWidth
            ) {
                p.active = false;
                if (p.type === "widen") {
                    paddleWidth *= 1.5;
                    setTimeout(() => { paddleWidth /= 1.5; }, 10000);
                }
                if (p.type === "slow") {
                    balls.forEach(b => { b.dx *= 0.7; b.dy *= 0.7; });
                    setTimeout(() => {
                        balls.forEach(b => { b.dx *= 1 / 0.7; b.dy *= 1 / 0.7; });
                    }, 10000);
                }
                if (p.type === "multiball") {
                    const newBalls = balls.map(b => ({
                        x: b.x,
                        y: b.y,
                        dx: -b.dx,
                        dy: b.dy,
                        radius: b.radius
                    }));
                    balls = balls.concat(newBalls);
                }
            }

            if (p.y > canvasHeight) p.active = false;
        }
    }
}

function drawBalls() {
    balls.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff66cc';
        ctx.fill();
        ctx.closePath();
    });
}

function moveBalls() {
    balls.forEach(b => {
        if (b.x + b.dx > canvasWidth - b.radius || b.x + b.dx < b.radius) b.dx = -b.dx;
        if (b.y + b.dy < b.radius) b.dy = -b.dy;
        else if (b.y + b.dy > canvasHeight - b.radius - paddleHeight - 10 * scale) {
            if (b.x > paddleX && b.x < paddleX + paddleWidth) {
                b.dy = -b.dy;
            } else if (b.y + b.dy > canvasHeight - b.radius) {
                balls = balls.filter(ball => ball !== b);
                if (balls.length === 0) {
                    isRunning = false;
                    cancelAnimationFrame(animationId);
                    gameOverScreen.classList.remove("hidden");
                    gameOverScreen.classList.add("show");
                }
            }
        }

        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                const bl = blocks[c][r];
                if (bl.status === 1) {
                    if (
                        b.x > bl.x &&
                        b.x < bl.x + blockWidth &&
                        b.y > bl.y &&
                        b.y < bl.y + blockHeight
                    ) {
                        b.dy = -b.dy;
                        bl.status = 0;

                        const types = ["widen", "slow", "multiball"];
                        const type = types[Math.floor(Math.random() * types.length)];

                        if (Math.random() < powerUpChance) {
                            powerUps.push({
                                x: bl.x + blockWidth / 2 - powerUpWidth / 2,
                                y: bl.y,
                                type: type,
                                active: true
                            });
                        }

                        score++;
                        if (score === blockRowCount * blockColumnCount) {
                            if (level < maxLevel) {
                                level++;
                                balls.forEach(b => { b.dx *= 1.2; b.dy *= 1.2; });
                                resetBlocks();
                                balls = [{ x: canvasWidth / 2, y: canvasHeight - 30, dx: 2 * scale, dy: -2 * scale, radius: 8 * scale }];
                                score = 0;
                            } else {
                                alert("Ты прошёл все уровни! 🏆");
                                document.location.reload();
                            }
                        }
                    }
                }
            }
        }

        b.x += b.dx;
        b.y += b.dy;
    });
}

function drawBlocks() {
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            if (blocks[c][r].status === 1) {
                const blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
                const blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                ctx.fillStyle = '#ffcc00';
                ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
            }
        }
    }
}

function resetBlocks() {
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            blocks[c][r].status = 1;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBlocks();
    drawPowerUps();
    drawBalls();
    drawPaddle();
    drawScore();
    moveBalls();

    if (rightPressed && paddleX < canvasWidth - paddleWidth) paddleX += 5 * scale;
    else if (leftPressed && paddleX > 0) paddleX -= 5 * scale;

    if (isRunning && !isPaused) {
        animationId = requestAnimationFrame(draw);
    }
}

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOverScreen");

startBtn.onclick = () => {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        draw();
    }
};

pauseBtn.onclick = () => {
    isPaused = !isPaused;
    if (!isPaused) draw();
    pauseBtn.textContent = isPaused ? "Продолжить" : "Пауза";
};

restartBtn.onclick = () => {
    location.reload();
};
