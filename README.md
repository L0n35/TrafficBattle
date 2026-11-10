# Traffic Battle

An endless lane-dodging game built with plain HTML, CSS and JavaScript. There's no framework, no canvas and no build step: everything on screen is an ordinary page element moved with CSS animations.

Switch between three lanes to dodge oncoming traffic. Every car you avoid scores a point, and the traffic gets faster the longer you survive.

**[▶ Play it in your browser](https://l0n35.github.io/TrafficBattle/)**

## How to play

- Press **Play** to start
- On a keyboard, **↑** / **↓** (or **W** / **S**) change lane
- On a phone, tap above your car to move up and below it to move down
- Each car that passes you scores a point
- Hit a car and it's game over. Your high score is saved in your browser

## How it works

- **Animated with CSS, not canvas.** The road and verges are a CSS gradient. The lane markings are repeating dashed backgrounds whose position is animated, so they loop seamlessly, and the trees and cars are page elements moved with CSS keyframes. Changing lane is a 100 ms CSS transition.
- **Traffic.** Each car crosses the road in its own CSS animation. When it finishes (`animationend`), the score goes up and the next car is placed in a random lane. Its animation is restarted by removing the class, forcing a reflow (`void element.offsetWidth`) and adding it back.
- **Collisions.** Every animation frame (`requestAnimationFrame`) the game compares the bounding boxes of your car and the oncoming car. There's a 10 px allowance so near misses don't count as crashes.
- **Fits any screen.** The game is laid out at 1000 × 500 px and scaled down to fit narrower screens.
- **Difficulty.** Speed comes from one table of levels in `scripts/game.js`, so adding a level is one line:

| Cars passed | New car every |
| ----------- | ------------- |
| 0–9         | 2.5 s         |
| 10–29       | 1.5 s         |
| 30–59       | 1 s           |
| 60–99       | 0.75 s        |
| 100+        | 0.5 s         |

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
scripts/game.js    levels, controls, collisions and scoring
static/            car and tree sprites
```

## Ideas

- More than one car on the road at once
- Sound effects
- Swipe controls as well as taps

Built in a day in February 2024, tidied up in November 2026.
