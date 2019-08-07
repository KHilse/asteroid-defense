console.log ("Loaded");

class Asteroid {

	constructor() {
		this.startXPosition = Math.random() * (container.clientWidth - 64);
		this.endXPosition = Math.random() * (container.clientWidth - 64);
		this.currentXPosition = this.startXPosition;
		this.currentYPosition = 0;
		this.centerXPosition = 0;
		this.centerYPosition = 0;
		this.element = document.createElement("img");
		this.element.setAttribute("class", "asteroid");
		this.element.style.top = "0px";
		this.element.style.left = "" + this.currentXPosition + "px";
		this.element.setAttribute("src", "img/asteroid" + Math.floor(Math.random() * asteroidImages.length) + ".gif");

		 container.appendChild(this.element);
	}

	move() {
		// move down by the AsteroidSpeed amount, and
		// move across by the x / slope

		var slope = (this.endXPosition - this.startXPosition) / container.clientHeight;
		this.currentXPosition = this.startXPosition + (this.currentYPosition * slope);
		this.currentYPosition += asteroidSpeed;
		this.centerXPosition = this.currentXPosition + 32;
		this.centerYPosition = this.currentYPosition + 32;

		this.element.style.top = "" + this.currentYPosition + "px";
		this.element.style.left = "" + this.currentXPosition + "px";

		if (this.currentYPosition >= container.clientHeight - 64) { // If the bottom of the asteroid hits the ground
			stopGame();
		}
	}

}

class Explosion {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.imgIndex = 0;
		this.range = 0;
		this.hitCount = 0;
		this.element = document.createElement("img");
		this.element.setAttribute("class", "explosion");
		container.appendChild(this.element);
	}

	animate() {
		if (this.imgIndex < 8) {
			this.element.setAttribute("src", "img/aa" + this.imgIndex + ".gif");
			this.element.style.top = "" + (this.y - 112) + "px";
			this.element.style.left = "" + (this.x - 112) + "px";
			switch (this.imgIndex) {
				case 0:
				case 7:
					this.range = 32;
					break;
				case 1:
				case 6:
					this.range = 64;
					break;
				case 2:
				case 5:
					this.range = 96;
					break;
				case 3:
				case 4:
					this.range = 112;
			}

			// Did we hit anything?
			// Have to compute the distance between the center points of the asteroids and the explosion itself
			var hitCount = 0;
			for (var i = 0; i < waveInfo.asteroidsInFlight.length; i++) {
				var dist = getDistance(this.x, this.y, waveInfo.asteroidsInFlight[i].centerXPosition, waveInfo.asteroidsInFlight[i].centerYPosition);
				if (dist < this.range) {
					this.hitCount++;
					updateScore(waveInfo.scoreAsteroid);
					container.removeChild(waveInfo.asteroidsInFlight[i].element);
					waveInfo.asteroidsInFlight.splice(i, 1);
					break; // Kill one asteroid per phase of animation
				}
			}
			this.imgIndex++;
		} else { // clean up after explosion
			if (this.hitCount > 1) {
				bonusScore(`${this.hitCount} hit bonus!`, 100 * this.hitCount, this.x, this.y);
				this.hitCount = 0;
			}
//			this.element.style.visibility == "hidden";
			container.removeChild(this.element);
			waveInfo.explosions.shift(); // Assuming the oldest explosion is the first index in the array
		}
	}
}


var cities = [	"Boston",
				"Chicago",
				"Detroit",
				"Los Angeles",
				"Miami",
				"New York",
				"Philadelphia",
				"San Diego"];

var skyCloudImages = [	"clouds0.jpg",
						"clouds1.jpg",
						"clouds2.jpg",
						"clouds3.jpg"];

var skyClearImages = [	"clear0.jpg",
						"clear1.jpg",
						"clear2.jpg"];

var asteroidImages = [	"asteroid0.gif",
						"asteroid1.gif",
						"asteroid2.gif",
						"asteroid3.gif"];

const GAME_INSTRUCTIONS = "Point and click to fire anti-asteroid guns and stop the asteroids before they hit the city!";
const INITIAL_ASTEROID_SPEED = 2;
const ASTEROID_INTERVAL = 32;
const INTERVAL_LENGTH = 50; // 50ms for release version
const BONUS_MESSAGE_DURATION = 5000;

var container = document.getElementById("game-container");
var scoreboard = document.getElementById("scoreboard");
var scoreElement = document.getElementById("score");
var bonusMessages = [];
var cityImg = document.getElementById("city").children[0];
var cloudImg = document.getElementById("clouds").children[0];
var skyImg = document.getElementById("sky").children[0];
var message = document.getElementById("message");

container.addEventListener("click", handleClick);

var gameInterval;
var asteroidSpeed;
var waveInfo = {
	numAsteroids: 5,
	asteroidsInFlight: [],
	explosions: [],
	scoreAsteroid: 100,
	scoreWave: 500
};
var score = 0;
var bonusMessageIndex = 0;
var waveCount = 0;
var tickCount = 0;
var explosionCount = 0;
var currentCity = "";
var weatherObj = { clouds: 0 };

// Before Start / Restart
	// 	Hide results if visible
	// 	Show message with instructions and start button
showStartMessage();

function handleClick(event) {
	console.log(event.target);
	if (event.target.id == "reset") {
		startGame();
	// } else if (event.target.id == "weather-effect") {
	// 	fireAA();
	// } else {
	// 	console.log("click not handled, doing nothing");
	// }
	} else {
		fireAA(event);
	}
}


// Game Start
function startGame(event) {
	console.log("startGame:");

	// event.stopPropagation();


	// 	Hide message box
	hideMessage();


	// 	Start Interval Timer
	asteroidSpeed = INITIAL_ASTEROID_SPEED;
	gameInterval = setInterval(tick, INTERVAL_LENGTH);
	
	// 	Start wave
	currentWave = 0;
	newWave();
	tickCount = 1;

	// Set click handler on game container
	//container.addEventListener("click", fireAA);

}

// Game Loop
function tick() {
	tickCount++;

	// Move Asteroids
	for (asteroid of waveInfo.asteroidsInFlight) {
		asteroid.move();
	}

	// 	Add Asteroids according to wave instructions
	// 		Every 500ms or so, add 0-2 Asteroids on random vectors
	if (tickCount > ASTEROID_INTERVAL && waveInfo.numAsteroids > 0) {
		for (var i = 0; i < Math.min(Math.random() + 0.3, waveInfo.numAsteroids); i++) {
			addAsteroid();
			waveInfo.numAsteroids--;
		}
		tickCount = 1;
	}


	// 	Player clicks create explosions with effective range
	// 		If a Asteroid is within range, kill the Asteroid
	for (var i = 0; i < waveInfo.explosions.length; i++) {
		waveInfo.explosions[i].animate();

	}


	// 	If any Asteroid hits the ground, game over
	// 	Check if wave is complete
	// 		Wave is complete when all Asteroids have been deployed, and
	if (waveInfo.numAsteroids == 0 && waveInfo.asteroidsInFlight.length == 0) {
		updateScore(waveInfo.scoreWave);
		waveInfo.waveCount++;
		newWave();
	}
	// 		All Asteroids have been destroyed or game is lost

	//	Update bonus messages
	var bonusMessages = document.querySelectorAll(".bonus");
	for (msg of bonusMessages) {
		if (msg.style.opacity == "") {
			msg.style.opacity = 1;
		} else {
			msg.style.opacity = Math.max(0, Number(msg.style.opacity) - .04);
		}
		msg.style.top = "" + (Number(msg.style.top.substring(0,msg.style.top.length-2)) - 1) + "px"; 
	}
}

function stopGame() {
	console.log("stopGame");
// Game Ended
// 	Stop game loop
clearInterval(gameInterval);
// 	Show message box
// 	Display results / score
// 	Show Score with Play Again button
}


function showStartMessage() {
	message.style.visibility = "visible";
	message.children[0].innerText = GAME_INSTRUCTIONS;
	message.children[1].value = "Start Game!";
//	message.children[1].addEventListener("click", startGame);
	// document.addEventListener("click", startGame);
}

function hideMessage() {
	message.children[0].innerText = "";
	message.style.visibility = "hidden";
}

function newWave() {
	waveCount++;
	tickCount = 1;
	asteroidSpeed += 0.5;
	waveInfo.numAsteroids = 5 + waveCount;
	document.getElementById("scoreboard-wave").children[0].innerText = "Wave " + waveCount + ", " + asteroidSpeed * 1000 + "m/sec, " + waveInfo.numAsteroids + " rocks";
	// Set new location
	// Set Environment
	currentCity = cities[Math.floor(Math.random() * cities.length)];
	cityImg.src = encodeURI("img/" + currentCity + ".gif");
	document.getElementById("scoreboard-location").children[0].innerText = currentCity;

	// Set current weather
	getCurrentWeather(currentCity);
	if (weatherObj.clouds > 0) { // TODO: set real threshold
		cloudImg.style.visibility = "visible"
		skyImg.src = "img/" + skyCloudImages[Math.floor(Math.random() * skyCloudImages.length)];
		document.getElementById("scoreboard-weather").children[0].innerText = "Cloudy";
	} else {
		cloudImg.style.visibility = "hidden";
		skyImg.src = "img/" + skyClearImages[Math.floor(Math.random() * skyClearImages.length)];
		document.getElementById("scoreboard-weather").children[0].innerText = "Clear";
	}
	// Asteroids in flight will be set per the Asteroid_INTERVAL check in the tick() method
}

function getCurrentWeather(currentCity) {
	fetch("http://api.openweathermap.org/data/2.5/weather?APPID=25ee5331a9008cc390c557875ca2bad0&q=" + currentCity.replace(/\s/, "+") + ",US")
	.then((response) => {
		return response.json();
	})
	.then((responseJson) => {
		weatherObj.clouds = responseJson.clouds.all;
	})
	.catch((e) => {
		console.log("Failed to get current weather from OpenWeather API");
		return false;
	})
}


function addAsteroid() {
	waveInfo.asteroidsInFlight.push(new Asteroid());
}


function fireAA(event) {
//	if (tickCount > 0) {
		waveInfo.explosions.push(new Explosion(event.x, event.y));
//	}
}

function getDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
}

function updateScore(val) {
	score += val;
	scoreElement.innerText = score;
}

function bonusScore(msg, val, x, y) {
	var bonusElement = document.createElement("p");
	bonusElement.setAttribute ("class", "bonus");
	bonusElement.innerText = msg;
	bonusElement.style.left = x.toString() + "px";
	bonusElement.style.top = y.toString() + "px";
	document.getElementById("game-container").appendChild(bonusElement);
	// bonusElement.setAttribute("class", "bonus bonus-end");
	setTimeout(() => {
		bonusElement.parentElement.removeChild(bonusElement);
	}, BONUS_MESSAGE_DURATION);
	updateScore(val);
}