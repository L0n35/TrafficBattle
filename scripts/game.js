"use strict";

// The game is laid out at this size and scaled to fit the screen.
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 500;

// Top position (px) of each lane, from the top lane down.
const LANE_TOPS = [100, 200, 300];

// How far two cars must overlap (px, at full size) before it counts as a crash.
const HIT_ALLOWANCE = 10;

const FIRST_CAR_DELAY = 1000;
const HIGH_SCORE_KEY = "trafficBattle.highScore";

// Each level starts once `from` cars have passed. `drive` is how long (ms) a
// car takes to cross the road, and a new car arrives every `every` ms.
const LEVELS = [
    { from: 0, every: 2500, drive: 2000 },
    { from: 10, every: 1500, drive: 1500 },
    { from: 30, every: 1000, drive: 1000 },
    { from: 60, every: 750, drive: 750 },
    { from: 100, every: 500, drive: 500 },
];

const stage = document.getElementById("stage");
const viewport = document.getElementById("viewport");
const game = document.getElementById("game");
const player = document.getElementById("player");
const traffic = document.getElementById("traffic");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const playButton = document.getElementById("play");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("high-score");

let running = false;
let lane = 1;
let carsPassed = 0;
let highScore = loadHighScore();
let scale = 1;
let spawnTimer = null;
let collisionFrame = null;

function loadHighScore() {
    try {
        return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch {
        return 0;
    }
}

function saveHighScore(value) {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, String(value));
    } catch {
        // Storage can be unavailable (e.g. some private browsing modes).
    }
}

function updateScore() {
    scoreText.textContent = `Score: ${carsPassed}`;
    highScoreText.textContent = `High Score: ${highScore || "-"}`;
}

function currentLevel() {
    let level = LEVELS[0];
    for (const candidate of LEVELS) {
        if (carsPassed >= candidate.from) {
            level = candidate;
        }
    }
    return level;
}

function fitToScreen() {
    scale = Math.min(1, viewport.clientWidth / GAME_WIDTH);
    game.style.transform = `scale(${scale})`;
    viewport.style.height = `${GAME_HEIGHT * scale}px`;
}

function setPlayerLane(newLane) {
    lane = Math.max(0, Math.min(LANE_TOPS.length - 1, newLane));
    player.style.top = `${LANE_TOPS[lane]}px`;
}

function moveUp() {
    if (running) {
        setPlayerLane(lane - 1);
    }
}

function moveDown() {
    if (running) {
        setPlayerLane(lane + 1);
    }
}

function spawnCar() {
    if (!running) {
        return;
    }
    const randomLane = Math.floor(Math.random() * LANE_TOPS.length);
    traffic.classList.remove("is-driving");
    traffic.style.top = `${LANE_TOPS[randomLane]}px`;
    traffic.style.animationDuration = `${currentLevel().drive}ms`;
    void traffic.offsetWidth; // force a reflow so the animation restarts from the beginning
    traffic.classList.add("is-driving");
}

function onCarPassed() {
    if (!running) {
        return;
    }
    carsPassed += 1;
    updateScore();
    const { every, drive } = currentLevel();
    spawnTimer = setTimeout(spawnCar, every - drive);
}

function overlaps(a, b, allowance) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();
    return !(
        rect1.right <= rect2.left + allowance ||
        rect1.left >= rect2.right - allowance ||
        rect1.bottom <= rect2.top + allowance ||
        rect1.top >= rect2.bottom - allowance
    );
}

function checkCollision() {
    if (!running) {
        return;
    }
    if (traffic.classList.contains("is-driving") && overlaps(player, traffic, HIT_ALLOWANCE * scale)) {
        crash();
        return;
    }
    collisionFrame = requestAnimationFrame(checkCollision);
}

function startGame() {
    clearTimeout(spawnTimer);
    cancelAnimationFrame(collisionFrame);

    running = true;
    carsPassed = 0;
    updateScore();

    traffic.classList.remove("is-driving");
    setPlayerLane(1);
    stage.classList.remove("is-over");
    stage.classList.add("is-running");
    overlay.hidden = true;

    spawnTimer = setTimeout(spawnCar, FIRST_CAR_DELAY);
    collisionFrame = requestAnimationFrame(checkCollision);
}

function crash() {
    running = false;
    clearTimeout(spawnTimer);

    stage.classList.remove("is-running");
    stage.classList.add("is-over");

    if (carsPassed > highScore) {
        highScore = carsPassed;
        saveHighScore(highScore);
    }
    updateScore();

    overlayTitle.textContent = "Crash!";
    playButton.textContent = "Play again";
    overlay.hidden = false;
    playButton.focus();
}

document.addEventListener("keydown", (event) => {
    if (!running) {
        return;
    }
    if (event.key === "ArrowUp" || event.key === "w") {
        event.preventDefault();
        moveUp();
    } else if (event.key === "ArrowDown" || event.key === "s") {
        event.preventDefault();
        moveDown();
    }
});

// Touch and mouse: tap above your car to move up, below it to move down.
viewport.addEventListener("pointerdown", (event) => {
    if (!running) {
        return;
    }
    const car = player.getBoundingClientRect();
    if (event.clientY < car.top + car.height / 2) {
        moveUp();
    } else {
        moveDown();
    }
});

traffic.addEventListener("animationend", onCarPassed);
playButton.addEventListener("click", startGame);
window.addEventListener("resize", fitToScreen);

setPlayerLane(1);
updateScore();
fitToScreen();
