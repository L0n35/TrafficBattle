const character = document.getElementById("character");
const block = document.getElementById("block");
const game = document.getElementById("game");
const score = document.getElementById("score");
const high_score_div = document.getElementById("high-score");
const play_div = document.getElementById("play-div");



const lanes = document.getElementsByClassName("lane");
const trees = document.getElementsByClassName("tree");

const laneArray = ["Left", "Middle", "Right"];

let AT20, AT15, AT10, AT2, AT1; // Define variables outside the functions to make them accessible globally

let count = 0;
cars_passed = 0;
let high_score = 0;

function resetGame() {
    // if      (position == "left")    { animateCharacter("animateLeftMiddle"); }
    // else if (position == "right")   { animateCharacter("animateRightMiddle"); }
    // position = "middle";

    play_div.style.display = "none";

    score.innerHTML="Score: " + 0;

    character.classList = "start"

    block.style.display = "block";
    const random = laneArray[Math.floor(Math.random() * laneArray.length)];
    block.classList.add(`traffic${random}`);
    for (let i = 0; i < lanes.length; i++) {
    lanes[i].style.display = "block";
    }
    for (let i = 0; i < trees.length; i++) {
    trees[i].style.display = "block";
    }
    character.style.display = "block";
    game.classList.remove("gameOver");

    let count = 0;
    cars_passed = 0;


    main();
}

function main() {

function animateCharacter(animationClass) {
  if (!character.classList.contains(animationClass)) {
    character.className = animationClass;
  }
}

function isOverlap(div1, div2) {
    var rect1 = div1.getBoundingClientRect();
    var rect2 = div2.getBoundingClientRect();
    
    // console.log(rect1.right, rect1.left, rect1.bottom, rect1.top);
    // console.log(rect2.left, rect2.right, rect2.top, rect2.bottom);

    return !(
      rect1.right <= rect2.left + 10|| 
      rect1.left >= rect2.right - 10|| 
      rect1.bottom <= rect2.top + 10|| 
      rect1.top >= rect2.bottom - 10
    );
}

function checkCollision() {
  const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
  const blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
  const blockTop = parseInt(window.getComputedStyle(block).getPropertyValue("top"));

  if(isOverlap(block, character) == true) {
    console.log("CRASH!");

    play_div.style.display = "flex";


    if (cars_passed > high_score) {
        high_score = cars_passed;
        high_score_div.innerHTML="High Score: " + high_score;

    }
  
  
//   if (blockLeft < 200 && blockLeft > 0) {

//     if (
//       (characterTop >= 100 && characterTop < 200 && blockTop >= 0 && blockTop < 100) || 
//       (characterTop >= 200 && characterTop < 300 && blockTop >= 100 && blockTop < 200) || 
//       (characterTop >= 300 && characterTop < 400 && blockTop >= 200 && blockTop < 300)
//     ) {
//       console.log("crash");

    block.style.display = "none";
    block.classList = "";
    for (let i = 0; i < lanes.length; i++) {
    lanes[i].style.display = "none";
    }
    for (let i = 0; i < trees.length; i++) {
    trees[i].style.display = "none";
    }
    character.style.display = "none";
    game.classList.add("gameOver");
    //clearInterval(is);

    
    
    clearInterval(AT20);
    clearInterval(AT15);
    clearInterval(AT10);
    clearInterval(AT2);
    clearInterval(AT1);

    clearInterval(cc);

}

}

function addTraffic() {
    cars_passed = cars_passed + 1;
    score.innerHTML="Score: " + cars_passed;
  const random = laneArray[Math.floor(Math.random() * laneArray.length)];

  if (block.classList.contains("trafficLeft"))          { block.classList.remove("trafficLeft"); }

  else if (block.classList.contains("trafficMiddle"))   { block.classList.remove("trafficMiddle"); }

  else if (block.classList.contains("trafficRight"))    { block.classList.remove("trafficRight"); } 

  block.classList.add(`traffic${random}`);

  // Remove any existing animation class
  block.classList.remove("speed1");

  // Add the animation class to trigger the animation
  void block.offsetWidth; // Trigger reflow
  block.classList.add("speed1");


  if(cars_passed == 10 || cars_passed == 30 || cars_passed == 60 || cars_passed == 100) {
    increaseSpeed();
  }
}

function increaseSpeed() {
  clearInterval(AT20);
  clearInterval(AT15);
  clearInterval(AT10);
  clearInterval(AT2);
  clearInterval(AT1);

  if (cars_passed >= 0 && cars_passed < 10) {
    block.classList.add("speed1");
    AT20 = setInterval(addTraffic, 2500);
  } else if (cars_passed >= 10 && cars_passed < 30) {
    block.classList.remove("speed1");
    block.classList.add("speed2");
    AT15 = setInterval(addTraffic, 1500);
  } else if (cars_passed >= 30 && cars_passed < 60) {
    block.classList.remove("speed2");
    block.classList.add("speed3");
    AT10 = setInterval(addTraffic, 1000);
  } else if (cars_passed >= 60 && cars_passed < 100) {
    block.classList.remove("speed3");
    block.classList.add("speed4");
    AT2 = setInterval(addTraffic, 750);
  } else if (cars_passed >= 100) {
    block.classList.remove("speed4");
    block.classList.add("speed5");
    AT1 = setInterval(addTraffic, 500);
  }
}

document.onkeydown = (e) => {
  if (e.key === "ArrowUp") {
    switch (position) {
      case "left":
        break;
      case "middle":
        animateCharacter("animateMiddleLeft");
        position = "left";
        console.log(isOverlap(block, character));
        setTimeout(1000);
        console.log(isOverlap(block, character));
        break;
      case "right":
        animateCharacter("animateRightMiddle");
        position = "middle";
        break;
    }
  }
  if (e.key === "ArrowDown") {
    switch (position) {
      case "left":
        animateCharacter("animateLeftMiddle");
        position = "middle";
        break;
      case "middle":
        animateCharacter("animateMiddleRight");
        position = "right";
        break;
      case "right":
        break;
    }
  }
}

var cc = setInterval(checkCollision, 10);
//setInterval(addTraffic, 2000);
increaseSpeed();

game.className = "";
game.id = "game";
position = "middle";
character.classList.add("start");

}

block.style.display = "none";
    block.classList = "";
    for (let i = 0; i < lanes.length; i++) {
    lanes[i].style.display = "none";
    }
    for (let i = 0; i < trees.length; i++) {
    trees[i].style.display = "none";
    }
    character.style.display = "none";
    game.classList.add("gameOver");

    clearInterval(AT20);
    clearInterval(AT15);
    clearInterval(AT10);
    clearInterval(AT2);
    clearInterval(AT1);

    clearInterval(cc);
//resetGame();
main();