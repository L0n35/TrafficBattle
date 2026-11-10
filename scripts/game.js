"use strict";

// The game is laid out at this size and scaled to fit the screen.
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 500;

// Top position (px) of each lane, from the top lane down.
const LANE_TOPS = [100, 200, 300];

// Oncoming cars start just off the right edge and drive this far left.
const TRAVEL = 1250;

// How far two cars must overlap (px, at full size) before it counts as a crash.
const HIT_ALLOWANCE = 10;

// Cars closer together than this (px) count as one "wall". A wall never covers
// every lane, so there's always a way through.
const SAFE_GAP = 450;

// Two cars in the same lane never get closer than this (px), so they don't overlap.
const SAME_LANE_GAP = 260;

// How far (in screen px) a finger has to move before it counts as a swipe.
const SWIPE_DISTANCE = 24;

const FIRST_CAR_DELAY = 1000;
const RETRY_DELAY = 150;
const HIGH_SCORE_KEY = "trafficBattle.highScore";
const MUTED_KEY = "trafficBattle.muted";

// Each level starts once `from` cars have passed. A new car arrives every
// `every` ms and takes `drive` ms to cross the road, so when `every` is less
// than `drive` there are several cars on the road at once. `pairChance` is how
// often two cars arrive side by side.
const LEVELS = [
    { from: 0, every: 2200, drive: 2000, pairChance: 0 },
    { from: 10, every: 1300, drive: 1700, pairChance: 0.1 },
    { from: 30, every: 1000, drive: 1400, pairChance: 0.2 },
    { from: 60, every: 800, drive: 1100, pairChance: 0.3 },
    { from: 100, every: 650, drive: 900, pairChance: 0.35 },
];

const stage = document.getElementById("stage");
const viewport = document.getElementById("viewport");
const game = document.getElementById("game");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const playButton = document.getElementById("play");
const muteButton = document.getElementById("mute");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("high-score");

let running = false;
let lane = 1;
let carsPassed = 0;
let highScore = Number(readSetting(HIGH_SCORE_KEY)) || 0;
let muted = readSetting(MUTED_KEY) === "true";
let scale = 1;
let spawnTimer = null;
let collisionFrame = null;

// Oncoming cars on the road: { element, lane, drive, spawnedAt }
let cars = [];

/* ---------- Settings saved in the browser ---------- */

function readSetting(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null; // Storage can be unavailable (e.g. some private browsing modes).
    }
}

function saveSetting(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch {
        // Ignore: the game still works, it just won't remember this.
    }
}

/* ---------- Sound effects ---------- */

// The sounds are generated with the Web Audio API, so there are no audio files.
let audio = null;

function getAudio() {
    if (!audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return null;
        }
        audio = new AudioContext();
    }
    if (audio.state === "suspended") {
        audio.resume();
    }
    return audio;
}

function tone(ctx, { freq, endFreq = freq, duration, type = "square", volume = 0.1, delay = 0 }) {
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
}

function noise(ctx, { duration, volume = 0.3, cutoff = 1000 }) {
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        samples[i] = (Math.random() * 2 - 1) * (1 - i / length); // fades out
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
}

const SOUNDS = {
    start(ctx) {
        tone(ctx, { freq: 440, duration: 0.1 });
        tone(ctx, { freq: 660, duration: 0.15, delay: 0.1 });
    },
    move(ctx) {
        tone(ctx, { freq: 300, endFreq: 520, duration: 0.07, type: "triangle", volume: 0.12 });
    },
    pass(ctx) {
        tone(ctx, { freq: 1200, duration: 0.04, volume: 0.03 });
    },
    levelUp(ctx) {
        [523, 659, 784, 1047].forEach((freq, i) => {
            tone(ctx, { freq, duration: 0.12, volume: 0.08, delay: i * 0.08 });
        });
    },
    crash(ctx) {
        noise(ctx, { duration: 0.6, volume: 0.5, cutoff: 900 });
        tone(ctx, { freq: 180, endFreq: 40, duration: 0.5, type: "sawtooth", volume: 0.15 });
    },
};

function playSound(name) {
    if (muted) {
        return;
    }
    const ctx = getAudio();
    if (ctx) {
        SOUNDS[name](ctx);
    }
}

function setMuted(value) {
    muted = value;
    saveSetting(MUTED_KEY, muted);
    muteButton.textContent = muted ? "🔇" : "🔊";
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    muteButton.title = muted ? "Unmute sound (M)" : "Mute sound (M)";
}

/* ---------- Score and levels ---------- */

function updateScore() {
    scoreText.textContent = `Score: ${carsPassed}`;
    highScoreText.textContent = `High Score: ${highScore || "-"}`;
}

function levelFor(passed) {
    let level = LEVELS[0];
    for (const candidate of LEVELS) {
        if (passed >= candidate.from) {
            level = candidate;
        }
    }
    return level;
}

function currentLevel() {
    return levelFor(carsPassed);
}

/* ---------- Layout and the player's car ---------- */

function fitToScreen() {
    scale = Math.min(1, viewport.clientWidth / GAME_WIDTH);
    game.style.transform = `scale(${scale})`;
    viewport.style.height = `${GAME_HEIGHT * scale}px`;
}

function setPlayerLane(newLane) {
    lane = Math.max(0, Math.min(LANE_TOPS.length - 1, newLane));
    player.style.top = `${LANE_TOPS[lane]}px`;
}

function moveBy(step) {
    if (!running) {
        return;
    }
    const target = Math.max(0, Math.min(LANE_TOPS.length - 1, lane + step));
    if (target !== lane) {
        setPlayerLane(target);
        playSound("move");
    }
}

/* ---------- Oncoming traffic ---------- */

// For a new car driving at `drive`, work out which lanes have a car it would
// come close to before that car leaves the road.
function lanesNearNewCar(drive, now) {
    const newSpeed = TRAVEL / drive;
    const near = new Set();
    const tooClose = new Set();
    for (const car of cars) {
        const speed = TRAVEL / car.drive;
        const elapsed = now - car.spawnedAt;
        const gapNow = speed * elapsed; // both start at the same spot
        const timeLeft = Math.max(0, car.drive - elapsed);
        const closest = gapNow - Math.max(0, newSpeed - speed) * timeLeft;
        if (closest < SAFE_GAP) {
            near.add(car.lane);
        }
        if (closest < SAME_LANE_GAP) {
            tooClose.add(car.lane);
        }
    }
    return { near, tooClose };
}

function combinations(items, size) {
    if (size === 1) {
        return items.map((item) => [item]);
    }
    const result = [];
    items.forEach((item, i) => {
        for (const rest of combinations(items.slice(i + 1), size - 1)) {
            result.push([item, ...rest]);
        }
    });
    return result;
}

// Pick lanes for `count` new cars so that at least one lane stays open.
function chooseLanes(count, drive, now) {
    const { near, tooClose } = lanesNearNewCar(drive, now);
    const allowed = LANE_TOPS.map((_, i) => i).filter((i) => !tooClose.has(i));
    const options = combinations(allowed, count).filter(
        (chosen) => new Set([...near, ...chosen]).size < LANE_TOPS.length
    );
    if (options.length === 0) {
        return null;
    }
    return options[Math.floor(Math.random() * options.length)];
}

function addCar(carLane, drive, now) {
    const element = document.createElement("img");
    element.className = "car traffic";
    element.src = "static/car2.png";
    element.alt = "Oncoming car";
    element.style.top = `${LANE_TOPS[carLane]}px`;
    element.style.animationDuration = `${drive}ms`;

    const car = { element, lane: carLane, drive, spawnedAt: now };
    element.addEventListener("animationend", () => onCarPassed(car));
    cars.push(car);
    game.appendChild(element);
}

function spawnWave() {
    if (!running) {
        return;
    }
    const { every, drive, pairChance } = currentLevel();
    const now = performance.now();
    const wanted = Math.random() < pairChance ? 2 : 1;
    const lanes = chooseLanes(wanted, drive, now) || (wanted === 2 ? chooseLanes(1, drive, now) : null);

    if (!lanes) {
        // Every option would close off the road, so wait a moment and try again.
        spawnTimer = setTimeout(spawnWave, RETRY_DELAY);
        return;
    }
    lanes.forEach((carLane) => addCar(carLane, drive, now));
    spawnTimer = setTimeout(spawnWave, every);
}

function onCarPassed(car) {
    car.element.remove();
    cars = cars.filter((other) => other !== car);
    if (!running) {
        return;
    }
    const levelBefore = currentLevel();
    carsPassed += 1;
    updateScore();
    playSound(currentLevel() !== levelBefore ? "levelUp" : "pass");
}

function removeAllCars() {
    for (const car of cars) {
        car.element.remove();
    }
    cars = [];
}

/* ---------- Collisions ---------- */

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
    for (const car of cars) {
        if (overlaps(player, car.element, HIT_ALLOWANCE * scale)) {
            crash();
            return;
        }
    }
    collisionFrame = requestAnimationFrame(checkCollision);
}

/* ---------- Starting and ending a game ---------- */

function startGame() {
    clearTimeout(spawnTimer);
    cancelAnimationFrame(collisionFrame);
    removeAllCars();

    running = true;
    carsPassed = 0;
    updateScore();

    setPlayerLane(1);
    stage.classList.remove("is-over");
    stage.classList.add("is-running");
    overlay.hidden = true;
    playSound("start");

    spawnTimer = setTimeout(spawnWave, FIRST_CAR_DELAY);
    collisionFrame = requestAnimationFrame(checkCollision);
}

function crash() {
    running = false;
    clearTimeout(spawnTimer);
    playSound("crash");

    stage.classList.remove("is-running");
    stage.classList.add("is-over");

    if (carsPassed > highScore) {
        highScore = carsPassed;
        saveSetting(HIGH_SCORE_KEY, highScore);
    }
    updateScore();

    overlayTitle.textContent = "Crash!";
    playButton.textContent = "Play again";
    overlay.hidden = false;
    playButton.focus();
}

/* ---------- Controls ---------- */

document.addEventListener("keydown", (event) => {
    if (event.key === "m" || event.key === "M") {
        setMuted(!muted);
        return;
    }
    if (!running) {
        return;
    }
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        event.preventDefault();
        moveBy(-1);
    } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        event.preventDefault();
        moveBy(1);
    }
});

// Touch and mouse: swipe up or down to change lane (keep swiping to move
// further), or tap above or below your car.
let gesture = null;

viewport.addEventListener("pointerdown", (event) => {
    if (!running) {
        return;
    }
    viewport.setPointerCapture(event.pointerId);
    gesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastY: event.clientY, swiped: false };
});

viewport.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id || !running) {
        return;
    }
    const dy = event.clientY - gesture.lastY;
    if (Math.abs(dy) >= SWIPE_DISTANCE) {
        moveBy(dy < 0 ? -1 : 1);
        gesture.lastY = event.clientY;
        gesture.swiped = true;
    }
});

viewport.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) {
        return;
    }
    const moved = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY);
    const wasTap = !gesture.swiped && moved < SWIPE_DISTANCE;
    gesture = null;
    if (!wasTap) {
        return;
    }
    const car = player.getBoundingClientRect();
    moveBy(event.clientY < car.top + car.height / 2 ? -1 : 1);
});

viewport.addEventListener("pointercancel", () => {
    gesture = null;
});

playButton.addEventListener("click", startGame);
muteButton.addEventListener("click", () => setMuted(!muted));
window.addEventListener("resize", fitToScreen);

setMuted(muted);
setPlayerLane(1);
updateScore();
fitToScreen();
