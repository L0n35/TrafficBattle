# Traffic Battle

An endless lane-dodging game built with plain HTML, CSS and JavaScript. There's no framework, no canvas, no build step and no audio files: everything on screen is an ordinary page element moved with CSS animations, and the sound effects are generated in the browser.

Switch between three lanes to dodge oncoming traffic. Every car you avoid scores a point. The longer you survive, the faster and busier the road gets.

**[▶ Play it in your browser](https://l0n35.github.io/TrafficBattle/)**

## How to play

- Press **Play** to start
- On a keyboard, **↑** / **↓** (or **W** / **S**) change lane
- On a phone, swipe up or down to change lane (keep swiping to move two lanes), or tap above or below your car
- Each car that passes you scores a point
- Hit a car and it's game over. Your high score is saved in your browser
- **M** or the 🔊 button turns the sound on and off

## How it works

- **Animated with CSS, not canvas.** The road and verges are a CSS gradient. The lane markings are repeating dashed backgrounds whose position is animated, so they loop seamlessly, and the trees and cars are page elements moved with CSS keyframes. Changing lane is a 100 ms CSS transition.
- **Traffic.** Each oncoming car is its own element with its own CSS animation. When it reaches the far side (`animationend`), it's removed and the score goes up. New cars arrive on a timer, so at higher levels several are on the road at once, sometimes two side by side.
- **Always a way through.** Before a car is placed, the game works out which other cars it will come within 450 px of before they leave the road, including faster cars catching up with slower ones. It never lets those cars cover all three lanes, and never puts two cars close together in the same lane.
- **Collisions.** Every animation frame (`requestAnimationFrame`) the game compares the bounding box of your car with each oncoming car. There's a 10 px allowance so near misses don't count as crashes.
- **Sound effects.** Made with the Web Audio API from simple tones and filtered noise: a beep to start, a blip when you change lane, a tick per car passed, a chime when you level up, and a crunch when you crash. The mute setting is saved in your browser.
- **Swipes and taps.** Pointer events handle both. A vertical movement of 24 px or more counts as a swipe and changes lane straight away, and a longer swipe keeps going. A touch that barely moves counts as a tap.
- **Fits any screen.** The game is laid out at 1000 × 500 px and scaled down to fit narrower screens.
- **Difficulty.** Everything comes from one table of levels in `scripts/game.js`, so tuning or adding a level is one line:

| Cars passed | New car every | Time to cross the road | Chance of two side by side |
| ----------- | ------------- | ---------------------- | -------------------------- |
| 0–9         | 2.2 s         | 2.0 s                  | –                          |
| 10–29       | 1.3 s         | 1.7 s                  | 10%                        |
| 30–59       | 1.0 s         | 1.4 s                  | 20%                        |
| 60–99       | 0.8 s         | 1.1 s                  | 30%                        |
| 100+        | 0.65 s        | 0.9 s                  | 35%                        |

## Run it locally

There's nothing to install. Clone the repo and open `index.html` in a browser:

```bash
git clone https://github.com/L0n35/TrafficBattle.git
cd TrafficBattle
open index.html   # macOS, or just double-click the file
```

## Project structure

```
index.html         page layout and game elements
style/style.css    road, scenery and car animations, plus screen scaling
scripts/game.js    levels, traffic, sound, controls, collisions and scoring
static/            car and tree sprites
```

## Ideas

- A pause button, and pausing automatically when you switch tabs
- Different vehicles with different speeds

Built in a day in February 2024, tidied up and extended in November 2026.
