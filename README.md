# Asteroid Defense
A simple game built using CSS and Javascript

I built this game as an HTML/CSS DOM manipulation project for my General Assembly immersive class. In addition, the game uses an AJAX query to use the OpenWeather API to grab current weather conditions for the cities that the player is defending in the game. If the weather in the real city is cloudy, it'll also be cloudy in the game!

## How to Play
	- Asteroids are heading towards your city and you must stop them!
	- Click near them to direct defensive fire and destroy them before they hit!
	- If an asteroid impacts on the ground, the game is over
	- Asteroids come in waves, with bonus score for completing each wave
	- There's also a bonus for destroying multiple asteroids with one shot
	- A wave consists of a number of asteroids fired in groups over time
	- A wave is completed when all the asteroids have been destroyed

## Future Cool Stuff
	- Day/night sky
	- Inclement weather
		Select weather types based on level, or use current weather from API
	- Chondritic Asteroid
		A wave may contain a chondritic asteroid that breaks up in the atmosphere
		All the fragments must be destroyed

## Game States
	Before Start / Restart
		Show message with instructions and start button
		Hide results if visible
	Game Start
		Hide message box
		Start Interval Timer
		Start wave
	Game Loop
		Add asteroids according to wave instructions
			Every 500ms or so, add 0-2 asteroids on random vectors
		Player clicks create explosions with effective range
			If an asteroid is within range, destroy the asteroid
		If any asteroid hits the ground, game over
		Check if wave is complete
			Wave is complete when all asteroids have been deployed, and
			Either all asteroids have been destroyed or game is lost
	Game Ended
		Stop game loop
		Show message box
		Display results / score
		Show Score with Play Again button

## Attributions
 [Travel vector created by freepik](https://www.freepik.com/free-photos-vectors/travel)

 [Background vector created by macrovector](https://www.freepik.com/free-photos-vectors/background)
 
 [Design vector created by freepik](https://www.freepik.com/free-photos-vectors/design)
 
 [Abstract vector created by macrovector_official](https://www.freepik.com/free-photos-vectors/abstract)