// Arkanoid — ПК-версия с 10 уровнями (v2.0) — полный рабочий скрипт

let isRunning = false;
let isPaused = false;
let animationId;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let paddleWidth = 75;
const paddleHeight = 10;
let paddleX = (canvasWidth - paddleWidth) / 2;

let score = 0;
let level = 1;
const maxLevel = 10;

let rightPressed = false;
let leftPressed = false;

let balls = [
    { x: canvasWidth / 2, y: canvasHeight - 30, dx: 2, dy: -2, radius: 8 }
];

let powerUps = [];
const powerUpTypes = [
    { type: "widen", symbol: "W", color: "#28a745", isBuff: true },
    { type: "multiball", symbol: "M", color: "#17a2b8", isBuff: true },
    { type: "slow", symbol: "F", color: "#6f42c1", isBuff: true },
    { type: "shrink", symbol: "S", color: "#dc3545", isBuff: false },
    { type: "fast", symbol: "B", color: "#fd7e14", isBuff: false },
    { type: "reverse", symbol: "Z", color: "#007bff", isBuff: false }
];

function createPowerUp(x, y) {
    const typeObj = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    powerUps.push({
        ...typeObj,
        x,
        y,
        active: true
    });
}

const powerUpWidth = 20;
const powerUpHeight = 20;
const powerUpChance = 0.3;

const blockRowCount = 5;
const blockColumnCount = 7;
const blockWidth = 55;
const blockHeight = 20;
const blockPadding = 10;
const totalBlockWidth = blockColumnCount * (blockWidth + blockPadding) - blockPadding;
const blockOffsetLeft = (canvasWidth - totalBlockWidth) / 2;
const blockOffsetTop = 30;

let blocks = [];

const levelLayouts = [
    [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
    [[1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 0, 1, 0, 1]],
    [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    [[1, 1, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0], [0, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0]],
    [[1, 1, 1, 0, 0], [0, 0, 0, 1, 1], [1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 0, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]],
    [[1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1]],
    [[0, 0, 0, 0, 1], [0, 0, 0, 1, 1], [0, 0, 1, 1, 1], [0, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 1, 1, 0, 0]],
    [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    [[1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0]],
    [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]]
];

function loadLevel(n) {
    const layout = levelLayouts[n - 1];
    for (let c = 0; c < blockColumnCount; c++) {
        blocks[c] = [];
        for (let r = 0; r < blockRowCount; r++) {
            blocks[c][r] = {
                x: 0,
                y: 0,
                status: layout[c] && layout[c][r] === 1 ? 1 : 0
            };
        }
    }
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

function drawPaddle() {
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(paddleX, canvasHeight - paddleHeight - 10, paddleWidth, paddleHeight);
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Очки: " + score, 8, 20);
    ctx.fillText("Уровень: " + level, canvasWidth - 100, 20);
}

function drawPowerUps() {
    powerUps.forEach(p => {
        if (!p.active) return;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, powerUpWidth, powerUpHeight);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(p.symbol, p.x + powerUpWidth / 2, p.y + powerUpHeight - 5);

        // Падение
        p.y += 2;

        // Проверка ловли
        if (
            p.y + powerUpHeight >= canvasHeight - paddleHeight - 10 &&
            p.x + powerUpWidth > paddleX &&
            p.x < paddleX + paddleWidth
        ) {
            applyPowerUp(p);
            p.active = false;
        }

        // Если упал за экран
        if (p.y > canvasHeight) {
            p.active = false;
        }
    });
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
    let anyBallActive = false;
    const activeBalls = [];

    balls.forEach(b => {
        let alive = true;
        if (b.x + b.dx > canvasWidth - b.radius || b.x + b.dx < b.radius) b.dx = -b.dx;
        if (b.y + b.dy < b.radius) b.dy = -b.dy;
        else if (b.y + b.dy > canvasHeight - b.radius - paddleHeight - 10) {
            if (b.x > paddleX && b.x < paddleX + paddleWidth) {
                b.dy = -b.dy;
            } else if (b.y + b.dy > canvasHeight - b.radius) {
                alive = false;
            }
        }

        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                const bl = blocks[c][r];
                if (bl.status === 1 &&
                    b.x > bl.x && b.x < bl.x + blockWidth &&
                    b.y > bl.y && b.y < bl.y + blockHeight) {
                    b.dy = -b.dy;
                    bl.status = 0;
                    score++;
                    if (Math.random() < powerUpChance) {
                        createPowerUp(bl.x + blockWidth / 2, bl.y);
                    }
                }
            }
        }

        if (alive) {
            b.x += b.dx;
            b.y += b.dy;
            activeBalls.push(b);
            anyBallActive = true;
        }
    });

    balls = activeBalls;

    if (blocks.flat().every(bl => bl.status === 0)) {
        if (level < maxLevel) {
            level++;
            balls.forEach(b => { b.dx *= 1.2; b.dy *= 1.2; });
            balls = [{ x: canvasWidth / 2, y: canvasHeight - 30, dx: 2, dy: -2, radius: 8 }];
            loadLevel(level);
            return;
        } else {
            alert("Ты прошёл все уровни! 🏆");
            document.location.reload();
        }
    }

    if (!anyBallActive) {
        isRunning = false;
        cancelAnimationFrame(animationId);
        gameOverScreen.classList.remove("hidden");
        gameOverScreen.classList.add("show");
    }
}

function movePowerUps() {
    const remaining = [];

    powerUps.forEach(p => {
        if (!p.active) return;

        p.y += 2;

        if (
            p.y + powerUpHeight >= canvasHeight - paddleHeight - 10 &&
            p.x > paddleX &&
            p.x < paddleX + paddleWidth
        ) {
            applyPowerUp(p);
            p.active = false;
        } else if (p.y < canvasHeight) {
            remaining.push(p);
        }
    });

    powerUps = remaining;
}


function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBlocks();
    drawPowerUps();
    function applyPowerUp(p) {
        if (p.type === "widen") {
            paddleWidth += 30;
            setTimeout(() => paddleWidth -= 30, 10000);
        }

        else if (p.type === "multiball") {
            const newBalls = balls.map(b => ({
                x: b.x,
                y: b.y,
                dx: -b.dx,
                dy: b.dy,
                radius: b.radius
            }));
            balls.push(...newBalls);
        }

        else if (p.type === "slow") {
            balls.forEach(b => {
                b.dx *= 0.7;
                b.dy *= 0.7;
            });
            setTimeout(() => {
                balls.forEach(b => {
                    b.dx /= 0.7;
                    b.dy /= 0.7;
                });
            }, 10000);
        }

        else if (p.type === "shrink") {
            paddleWidth = Math.max(40, paddleWidth - 30);
            setTimeout(() => paddleWidth += 30, 10000);
        }

        else if (p.type === "fast") {
            balls.forEach(b => {
                b.dx *= 1.5;
                b.dy *= 1.5;
            });
            setTimeout(() => {
                balls.forEach(b => {
                    b.dx /= 1.5;
                    b.dy /= 1.5;
                });
            }, 10000);
        }

        else if (p.type === "reverse") {
            const origLeft = leftPressed;
            const origRight = rightPressed;

            document.addEventListener("keydown", reverseHandler);
            document.addEventListener("keyup", reverseHandler);

            function reverseHandler(e) {
                if (e.key === "ArrowRight") leftPressed = e.type === "keydown";
                if (e.key === "ArrowLeft") rightPressed = e.type === "keydown";
            }

            setTimeout(() => {
                document.removeEventListener("keydown", reverseHandler);
                document.removeEventListener("keyup", reverseHandler);
                leftPressed = origLeft;
                rightPressed = origRight;
            }, 10000);
        }
    }

    drawBalls();
    drawPaddle();
    drawScore();
    moveBalls();

    if (rightPressed && paddleX < canvasWidth - paddleWidth) paddleX += 5;
    else if (leftPressed && paddleX > 0) paddleX -= 5;

    if (isRunning && !isPaused) {
        animationId = requestAnimationFrame(draw);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
});

document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddleX = mouseX - paddleWidth / 2;
});

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOverScreen");

startBtn.onclick = () => {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        loadLevel(level);
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
