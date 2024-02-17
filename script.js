var character = document.getElementById("character");
var block = document.getElementById("block");
var game = document.getElementById("game")
var score = document.getElementById("score");

var lanes = document.getElementsByClassName("lane");
var trees = document.getElementsByClassName("tree");

const laneArray = ["Left", "Middle", "Right"];

// function jump() {
//     if(character.classList != "animate") {
//         character.classList.add("animate")
    
//         setTimeout(function() {
//             character.classList.remove("animate")
//         }, 500);
//     }
// }

function main() {
    game.className = "";
    game.id = "game";

function jeff() {
    console.log("charTop", characterTop);
    console.log("blockLeft", blockLeft);
}

function changeLaneLeftMiddle() {
    character.className = "";
    if(character.classList != "animateLeftMiddle") {
        character.classList.add("animateLeftMiddle")
    }
}
function changeLaneMiddleRight() {
    character.className = "";
    if(character.classList != "animateMiddleRight") {
        character.classList.add("animateMiddleRight")
    }
}
function changeLaneRightMiddle() {
    character.className = "";
    if(character.classList != "animateRightMiddle") {
        character.classList.add("animateRightMiddle")
    }
}
function changeLaneMiddleLeft() {
    character.className = "";
    if(character.classList != "animateMiddleLeft") {
        character.classList.add("animateMiddleLeft")
    }
}

var checkDead = setInterval(function() {
    var characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
    var blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
    var blockTop = parseInt(window.getComputedStyle(block).getPropertyValue("top"));
    // console.log("charTop", characterTop);
    // console.log("blockLeft", blockLeft);
    // console.log("blockTop", blockTop);
    // if (blockLeft<200 && blockLeft>0 && characterTop>=0) {
    if (blockLeft<200 && blockLeft>0) {

        if ((characterTop >= 100 && characterTop < 200 && blockTop >= 0 && blockTop < 100) || 
            (characterTop >= 200 && characterTop < 300 && blockTop >= 100 && blockTop < 200) || 
            (characterTop >= 300 && characterTop < 400 && blockTop >= 200 && blockTop < 300)) {
            console.log("crash");

            block.style.animation = "none";
            block.style.display = "none";
            lanes.style = "none";
            character.style.display = "none"
            for (var i = 0; i < lanes.length; i ++) {
                lanes[i].style.display = "none";
            }
            for (var i = 0; i < trees.length; i ++) {
                trees[i].style.display = "none";
            }

            //game.style.display = "none";
            game.id = "";
            game.classList.add("gameOver");

            clearInterval(add_traffic);
            clearInterval(game_timer);

        }
        // if (characterTop >= 100 && characterTop < 200 && blockTop >= 0 && blockTop < 100) {
        //     console.log("left")
        // } else if (characterTop >= 200 && characterTop < 300 && blockTop >= 100 && blockTop < 200) {
        //     console.log("middle")
        // } else if (characterTop >= 300 && characterTop < 400 && blockTop >= 200 && blockTop < 300) {
        //     console.log("right")
        // }

        // console.log("charTop", characterTop);
        // console.log("blockLeft", blockLeft);
    }
}, 10)

var position = "middle"
character.classList.add("start");

document.onkeydown = (e) => {
    e = e || window.event;
    if (e.key === "ArrowUp") {
        switch(position) {
            case "left":
                break;
            case "middle":
                changeLaneMiddleLeft();
                position = "left"
                break;
            case "right":
                changeLaneRightMiddle();
                position = "middle"
                break;
        }
    }
    if (e.key === "ArrowDown") {
        switch(position) {
            case "left":
                changeLaneLeftMiddle();
                position = "middle"
                break;
            case "middle":
                changeLaneMiddleRight();
                position = "right"
                break;
            case "right":
                break;
        }
    }
}

function addTraffic() {
    const random = laneArray[Math.floor(Math.random() * laneArray.length)];
    switch(random) {
        case "Left":
            block.className = "";
            block.classList.add("trafficLeft");
            break;
        case "Middle":
            block.className = "";
            block.classList.add("trafficMiddle");
            break;
        case "Right":
            block.className = "";
            block.classList.add("trafficRight");
            break;
    }
}

var count = 0;
function Timer() {
    count += 1;
    
    score.innerHTML="Score: " + count;
    console.log(count);

    if (count >= 0 && count < 6) {
        block.classList.add("speed1");
    } else if (count >= 6 && count < 12) {
        block.classList.remove("speed1");
        block.classList.add("speed2");
    } else if (count >= 15) {
        block.classList.remove("speed2");
        block.classList.add("speed3");
    } 

}


const add_traffic = setInterval(addTraffic, 2000);
const game_timer = setInterval(Timer, 2000)

}

main();