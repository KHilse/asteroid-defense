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
	constructor(x, y, idx) {
		this.x = x;
		this.y = y;
		this.imgIndex = 0;
		this.idx = idx;
		this.range = 0;
		this.element = document.createElement("img");
		this.element.setAttribute("class", "explosion");
		this.element.setAttribute("src", "#");
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
			for (var i = 0; i < waveInfo.asteroidsInFlight.length; i++) {
				var dist = getDistance(this.x, this.y, waveInfo.asteroidsInFlight[i].centerXPosition, waveInfo.asteroidsInFlight[i].centerYPosition);
				if (dist < (this.range * 1.5)) {
					console.log("i", i, "asteroids:", waveInfo.asteroidsInFlight.length);

					container.removeChild(waveInfo.asteroidsInFlight[i].element);
					waveInfo.asteroidsInFlight.splice(i, 1);
					console.log("i", i, "asteroids:", waveInfo.asteroidsInFlight.length);
					break;	// remove one asteroid at a time
				}
			}


			this.imgIndex++;
		} else { // clean up after explosion
			this.element.style.visibility == "hidden";
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

var container = document.getElementById("game-container");
var scoreboard = document.getElementById("scoreboard");
var cityImg = document.getElementById("city").children[0];
var cloudImg = document.getElementById("clouds").children[0];
var skyImg = document.getElementById("sky").children[0];
var message = document.getElementById("message");

var gameInterval;
var asteroidSpeed;
var waveInfo = {
	numAsteroids: 5,
	asteroidsInFlight: [],
	explosions: [],
	bomberPass: false
};
var waveCount = 0;
var tickCount = 0;
var explosionCount = 0;
var currentCity = "";
var weatherObj = { clouds: 0 };

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
	asteroidSpeed = INITIAL_ASTEROID_SPEED;
	gameInterval = setInterval(tick, INTERVAL_LENGTH);
	
	// 	Start wave
	currentWave = 0;
	newWave();
	tickCount = 1;

	// Set click handler on game container
	container.addEventListener("click", fireAA);

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
	// 		All Asteroids have been destroyed or game is lost
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
	message.children[1].addEventListener("click", startGame);
	// document.addEventListener("click", startGame);
}

function hideMessage() {
	message.children[0].innerText = "";
	message.style.visibility = "hidden";
}

function newWave() {
	waveCount++;
	tickCount = 1;
	waveInfo.numAsteroids = 5 + waveCount;
	if (!(waveCount % 5)) {
		waveInfo.bomberPass = true;
	} else {
		waveInfo.bomberPass = false;
	}



	// Set new location
	// Set Environment
	currentCity = cities[Math.floor(Math.random() * cities.length)];
	cityImg.src = encodeURI("img/" + currentCity + ".gif");

	// Set current weather
	getCurrentWeather(currentCity);
	if (weatherObj.clouds > 0) { // TODO: set real threshold
		cloudImg.style.visibility = "visible"
		skyImg.src = "img/" + skyCloudImages[Math.floor(Math.random() * skyCloudImages.length)];
	} else {
		cloudImg.style.visibility = "hidden";
		skyImg.src = "img/" + skyClearImages[Math.floor(Math.random() * skyClearImages.length)];
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
	console.log("Clicked:", event.location);
	if (tickCount > 0) {
		waveInfo.explosions.push(new Explosion(event.clientX, event.clientY, explosionCount++));
	}
}

function getDistance(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1)^2 + (y2 - y1)^2);
}