console.log ("Loaded");

class Missile {

	constructor() {
		this.startXPosition = Math.random() * container.clientWidth;
		this.endXPosition = Math.random() * container.clientWidth;
		this.currentXPosition = this.startXPosition;
		this.currentYPosition = 0;
	}

	move() {
		// move down by the missileSpeed amount, and
		// move across by the x / slope

		var slope = (this.startXPosition - this.endXPosition) / container.clientHeight;
		this.currentXPosition = this.startXPosition + (this.currentYPosition * slope);
		this.currentYPosition += missileSpeed;
	}

}

const GAME_INSTRUCTIONS = "Point and click to fire anti-missile guns and stop the missiles before they hit the city!";
const INITIAL_MISSILE_SPEED = 2;
const MISSILE_INTERVAL = 3;
const INTERVAL_LENGTH = 1000; // 50ms for release version

var container = document.getElementById("game-container");
var scoreboard = document.getElementById("scoreboard");
var city = document.getElementById("city");
var clouds = document.getElementById("clouds");
var sky = document.getElementById("sky");
var message = document.getElementById("message");

var gameInterval;
var missileSpeed;
var waveInfo = {
	numMissiles: 5,
	missilesInFlight: [],
	bomberPass: false
};
var waveCount = 0;
var tickCount;

// Before Start / Restart
	// 	Hide results if visible
	// 	Show message with instructions and start button
showStartMessage();

// Game Start
function startGame() {
	console.log("startGame:");
// 	Hide message box
	hideMessage();
// 	Start Interval Timer
	missileSpeed = INITIAL_MISSILE_SPEED;
	gameInterval = setInterval(tick, INTERVAL_LENGTH);
// 	Start wave
	currentWave = 0;
	newWave();
	tickCount = 1;
}

// Game Loop
function tick() {
	tickCount++;

	// Move missiles
	for (missile of waveInfo.missilesInFlight) {
		missile.move();
	}

	// 	Add missiles according to wave instructions
	// 		Every 500ms or so, add 0-2 missiles on random vectors
	if (tickCount > MISSILE_INTERVAL && waveInfo.numMissiles > 0) {
		for (var i = 0; i < Math.min(Math.random()*3, waveInfo.numMissiles); i++) {
			addMissile();
			waveInfo.numMissiles--;
		}
		tickCount = 1;
	}


	// 	Player clicks create explosions with effective range
	// 		If a missile is within range, kill the missile
	// 	If any missile hits the ground, game over
	// 	Check if wave is complete
	// 		Wave is complete when all missiles have been deployed, and
	// 		All missiles have been destroyed or game is lost
}

function stopGame() {
// Game Ended
// 	Stop game loop
// 	Show message box
// 	Display results / score
// 	Show Score with Play Again button
}


function showStartMessage() {
	message.style.visibility = "visible";
	message.children[0].innerText = GAME_INSTRUCTIONS;
	message.children[1].value = "Start Game!";
	message.children[1].addEventListener("click", startGame);
	// document.addEventListener("click", startGame);
}

function hideMessage() {
	message.children[0].innerText = "";
	message.style.visibility = "hidden";
}

function newWave() {
	waveCount++;
	waveInfo.numMissiles = 5 + waveCount;
	if (!(waveCount % 5)) {
		waveInfo.bomberPass = true;
	} else {
		waveInfo.bomberPass = false;
	}
	// Missiles in flight will be set per the MISSILE_INTERVAL check in the tick() method
}

function addMissile() {
	waveInfo.missilesInFlight.push(new Missile());
}


// var missile = document.createElement("div");
// missile.x = 0;
// missile.y = 0;
// missile.setAttribute("id", "my-missile");
// missile.setAttribute("class", "missile");
// missile.style.top = "0px";
// missile.style.left = "" + Math.random() * container.clientWidth + "px";
// container.appendChild(missile);


// function tick() {
// 	if (missile.y < container.clientHeight) {
// 		missile.y += MISSILE_SPEED;
// 		missile.style.top = `${missile.y}px`;
// 	} else {
// 		clearInterval(gameInterval);
// 	}
// }