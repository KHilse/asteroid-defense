// GLOBALS

	// IMAGES
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

	// CONSTANTS
	const GAME_INSTRUCTIONS = "Point and click to fire anti-asteroid guns and stop the asteroids before they hit the city!";
	const END_GAME_MESSAGE = "The asteroids destroyed the city as they always do, those bastards. But you saved lots of lives!";
	const KILLED_AIRCRAFT = "(except for the folks in the aircraft you shot down, good job on that -- NOT!)";
	const INITIAL_ASTEROID_SPEED = 2;
	const ASTEROID_SPEED_INCREMENT = 0.5;
	const INITIAL_ASTEROID_COUNT = 5;
	const ASTEROID_INTERVAL = 32;
	const INTERVAL_LENGTH = 50; // 50ms for release version
	const BONUS_MESSAGE_DURATION = 2000;
	const BONUS_MULTIPLIER = 100;
	const ASTEROID_SIZE = 64;
	const EXPLOSION_SIZE = 225;
	const EXPLOSION_SOUND_COUNT = 16;
	const AIRPLANE_WIDTH = 64;
	const AIRPLANE_HEIGHT = 27;

	// DOM ELEMENTS
	var container = document.getElementById("game-container");
	var scoreboard = document.getElementById("scoreboard");
	var scoreElement = document.getElementById("score");
	var cityImg = document.getElementById("city").children[0];
	var cloudImg = document.getElementById("clouds").children[0];
	var skyImg = document.getElementById("sky").children[0];
	var mushroomCloudElement = document.getElementById("mushroom-cloud");
	var message = document.getElementById("message");

	// GAME VARIABLES
	var gameInterval;
	var asteroidSpeed;
	var waveInfo = {
		numAsteroids: INITIAL_ASTEROID_COUNT,
		asteroidsInFlight: [],
		airplanesInFlight: [],
		explosions: [],
		scoreAsteroid: 100,
		scoreAirplane: -100,
		scoreWave: 500
	};
	var score = 0;
	var bonusMessageIndex = 0;
	var waveCount = 0;
	var tickCount = 0;
	var explosionCount = 0;
	var currentCity = "";
	var weatherObj = { clouds: 0 };
	var aircraftKilled = false;

// CLASSES
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
			this.centerXPosition = this.currentXPosition + ASTEROID_SIZE / 2;
			this.centerYPosition = this.currentYPosition + ASTEROID_SIZE / 2;

			this.element.style.top = "" + this.currentYPosition + "px";
			this.element.style.left = "" + this.currentXPosition + "px";

			 // If the bottom of the asteroid hits the ground, stop the game
			if (this.currentYPosition >= container.clientHeight - ASTEROID_SIZE) {
				stopGame();
			}
		}
	}

	class Airplane {

		constructor() {
			if (Math.random() < 0.5) {
				this.orientation = "left";
				this.startXPosition = container.clientWidth;
				this.startYPosition = (Math.random() * container.clientHeight / 2) + (container.clientHeight / 4);
				this.endXPosition = -64;
				this.endYPosition = (Math.random() * container.clientHeight / 2) + (container.clientHeight / 4);
				this.moveValue = -2;
			} else {
				this.orientation = "right";
				this.startXPosition = -64;
				this.startYPosition = (Math.random() * container.clientHeight / 2) + (container.clientHeight / 4);
				this.endXPosition = container.clientWidth;
				this.endYPosition = (Math.random() * container.clientHeight / 2) + (container.clientHeight / 4);
				this.moveValue = 2;
			}
			this.currentXPosition = this.startXPosition;
			this.currentYPosition = this.startYPosition;
			this.centerXPosition = this.startXPosition + 32;
			this.centerYPosition = this.startYPosition + 14;
			this.element = document.createElement("img");
			this.element.setAttribute("class", "airplane");
			this.element.style.top = "" + this.currentYPosition + "px";
			this.element.style.left = "" + this.currentXPosition + "px";
			this.element.setAttribute("src", "img/airplane-" + this.orientation + ".gif");

			container.appendChild(this.element);
		}

		move() {
			// move across by the moveValue amount, and
			// move up/down by the x / slope
			var slope = (this.endYPosition - this.startYPosition) / container.clientWidth;
			this.currentXPosition += this.moveValue;
			this.currentYPosition += this.moveValue * slope;
			this.centerXPosition = this.currentXPosition + AIRPLANE_WIDTH / 2;
			this.centerYPosition = this.currentYPosition + AIRPLANE_HEIGHT / 2;

			this.element.style.top = "" + this.currentYPosition + "px";
			this.element.style.left = "" + this.currentXPosition + "px";
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
				this.element.style.top = "" + (this.y - Math.floor(EXPLOSION_SIZE / 2)) + "px";
				this.element.style.left = "" + (this.x - Math.floor(EXPLOSION_SIZE / 2)) + "px";
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
						removeAsteroid(i);
						break; // Kill one asteroid per phase of animation
					}
				}
				for (var i = 0; i < waveInfo.airplanesInFlight.length; i++) {
					var dist = getDistance(this.x, this.y, waveInfo.airplanesInFlight[i].centerXPosition, waveInfo.airplanesInFlight[i].centerYPosition);
					if (dist < this.range) {
						// updateScore(waveInfo.scoreAirplane);
						bonusScore(`Airplane hit!`, waveInfo.scoreAirplane, this.x, this.y);
						removeAirplane(i);
						aircraftKilled = true;
						break; // Kill one airplane per phase of animation
					}
				}
				this.imgIndex++;
			} else { // clean up elements after explosion and assign bonuses
				if (this.hitCount > 1) {
					bonusScore(`${this.hitCount} hit bonus!`, BONUS_MULTIPLIER * this.hitCount, this.x, this.y);
					this.hitCount = 0;
				}
				removeExplosion(0);
			}
		}
	}


// GAME ENTRY POINT

	//	Before Start / Restart
	//		Hide results if visible
	//		Show message with instructions and start button
	container.addEventListener("click", handleClick);
	mushroomCloudElement.style.visibility = "hidden";
	showStartMessage();
	loadSounds();


// FUNCTIONS

function handleClick(event) {
	console.log(event.target);
	if (event.target.id == "reset") {
		startGame();
	} else {
		playExplosion();
		fireAA(event);
	}
}

function startGame(event) {

	// Reset game data
	score = 0;
	waveCount = 0;
	explosionCount = 0;
	asteroidSpeed = INITIAL_ASTEROID_SPEED;
	waveInfo.numAsteroids = INITIAL_ASTEROID_COUNT;	
	mushroomCloudElement.style.visibility = "hidden";
	aircraftKilled = false;

	while (waveInfo.asteroidsInFlight.length > 0) {
		removeAsteroid(0);
	}
	while (waveInfo.explosions.length > 0) {
		removeExplosion(0);
	}

	// 	Hide message box
	hideMessage();

	// 	Start Interval Timer
	gameInterval = setInterval(tick, INTERVAL_LENGTH);
	
	// 	Start wave
	currentWave = 0;
	newWave();
	tickCount = 1;
}

// Game Loop
function tick() {
	tickCount++;

	// Move Asteroids
	for (asteroid of waveInfo.asteroidsInFlight) {
		asteroid.move();
	}

	// 	Add Asteroids according to wave instructions
	// 		Every so often, add 0-2 Asteroids on random vectors
	//		Until the number of asteroids in the current wave is reached
	if (tickCount > ASTEROID_INTERVAL && waveInfo.numAsteroids > 0) {
		for (var i = 0; i < Math.min(Math.random() + 0.3, waveInfo.numAsteroids); i++) {
			addAsteroid();
			waveInfo.numAsteroids--;
		}
		tickCount = 1;
	}

	// Add airplanes randomly
	if (Math.random() < 0.01) {
		addAirplane();
	}

	// Move airplanes
	for (var i = 0; i < waveInfo.airplanesInFlight.length; i++) {
		waveInfo.airplanesInFlight[i].move();
	}

	// 	Player clicks create explosions with effective range
	// 		If a Asteroid is within range, kill the Asteroid
	for (var i = 0; i < waveInfo.explosions.length; i++) {
		waveInfo.explosions[i].animate();
	}

	//	Check if wave is complete
	//		Wave is complete when all Asteroids have been deployed, and
	//		All Asteroids have been destroyed or game is lost
	if (waveInfo.numAsteroids == 0 && waveInfo.asteroidsInFlight.length == 0) {
		updateScore(waveInfo.scoreWave);
		waveInfo.waveCount++;
		newWave();
	}

	//	Update bonus messages
	var bonusMessages = document.querySelectorAll(".bonus,.penalty");
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
	// 	Stop game loop
	clearInterval(gameInterval);
	// Show mushroom cloud
	mushroomCloudElement.style.visibility = "visible";
	// 	Show message box
	message.style.visibility = "visible";
	// 	Display results / score
	var resultMessage = END_GAME_MESSAGE;
	if (aircraftKilled) {
		resultMessage += KILLED_AIRCRAFT;
	}
	message.children[0].innerHTML = resultMessage + "<br /><br />Score: " + score;
	// 	Show Play Again button
	message.children[1].value = "Play again!";
	document.getElementById("sound-game-over").play();
}

function showStartMessage() {
	message.style.visibility = "visible";
	message.children[0].innerText = GAME_INSTRUCTIONS;
	message.children[1].value = "Start Game!";
}

function hideMessage() {
	message.children[0].innerText = "";
	message.style.visibility = "hidden";
}

function newWave() {
	waveCount++;
	tickCount = 1;
	asteroidSpeed += ASTEROID_SPEED_INCREMENT;
	waveInfo.numAsteroids = 5 + waveCount;
	updateScoreboardWave();
	removeAllAirplanes();

	// Set new location
	currentCity = cities[Math.floor(Math.random() * cities.length)];
	cityImg.src = encodeURI("img/" + currentCity + ".gif");
	document.getElementById("scoreboard-location").children[0].innerText = currentCity;

	// Set current weather
	getCurrentWeather(currentCity);
	if (weatherObj.clouds > 10) {
		cloudImg.style.visibility = "visible"
		skyImg.src = "img/" + skyCloudImages[Math.floor(Math.random() * skyCloudImages.length)];
		document.getElementById("scoreboard-weather").children[0].innerText = "Cloudy";
	} else {
		cloudImg.style.visibility = "hidden";
		skyImg.src = "img/" + skyClearImages[Math.floor(Math.random() * skyClearImages.length)];
		document.getElementById("scoreboard-weather").children[0].innerText = "Clear";
	}
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
		weatherObj.clouds = 0;
		return false;
	})
}

function addAirplane() {
	waveInfo.airplanesInFlight.push(new Airplane());
}

function removeAirplane(i) {
	container.removeChild(waveInfo.airplanesInFlight[i].element);
	waveInfo.airplanesInFlight.splice(i, 1);
}

function removeAllAirplanes() {
	for (var i = 0; i < waveInfo.airplanesInFlight.length; i++) {
		container.removeChild(waveInfo.airplanesInFlight[i].element);
	}
	waveInfo.airplanesInFlight = [];
}

function addAsteroid() {
	waveInfo.asteroidsInFlight.push(new Asteroid());
	updateScoreboardWave();
}

function removeAsteroid(i) {
	container.removeChild(waveInfo.asteroidsInFlight[i].element);
	waveInfo.asteroidsInFlight.splice(i, 1);
	updateScoreboardWave();
}

function fireAA(event) {
	// Calculate the mouse click position relative to the game container
	var offsetXDiff = event.x - event.offsetX;
	var offsetYDiff = event.y - event.offsetY;
	addExplosion(event.x - offsetXDiff, event.y - offsetYDiff);
}

function addExplosion(x, y) {
	waveInfo.explosions.push(new Explosion(x, y));
}

function removeExplosion(i) {
	container.removeChild(waveInfo.explosions[i].element);
	waveInfo.explosions.splice(i, 1);
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
	if (val > 0) {
		bonusElement.setAttribute ("class", "bonus");
		bonusElement.style.left = x.toString() + "px";
		bonusElement.style.top = y.toString() + "px";
	} else {
		bonusElement.setAttribute ("class", "penalty");
		bonusElement.style.left = (x - 10).toString() + "px";
		bonusElement.style.top = (y - 10).toString() + "px";
	}
	bonusElement.innerText = msg;
	document.getElementById("game-container").appendChild(bonusElement);
	setTimeout(() => {
		bonusElement.parentElement.removeChild(bonusElement);
	}, BONUS_MESSAGE_DURATION);
	updateScore(val);
}

function updateScoreboardWave() {
	document.getElementById("scoreboard-wave").children[0].innerText = "Wave " + waveCount + ", " + asteroidSpeed * 1000 + "m/sec, " + waveInfo.asteroidsInFlight.length + "/" + waveInfo.numAsteroids + " asteroids";
}

function playExplosion() {
	document.getElementById("sound-explosion-" + (explosionCount++ % EXPLOSION_SOUND_COUNT)).play();
}

function loadSounds() {
	for (var i = 0; i < EXPLOSION_SOUND_COUNT; i++) {
		var el = document.createElement("audio");
		el.id = "sound-explosion-" + i;
		el.src = "sounds/explosion-01.wav";
		el.type = "audio/wav";
		el.preload = "auto";
		document.getElementsByTagName("body")[0].appendChild(el);
	}
}