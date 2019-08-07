# asteroid-defense
A simple game built using CSS and Javascript with JQuery for HTML DOM manipulation


Basic Game (sprint 1)
	*	Asteroids are heading towards your city and you must stop them! Click near them to direct defensive fire and destroy them before they hit!
	*	If an asteroid impacts on the ground, the game is over.
	*	Asteroids come in waves, with bonus score for completing each wave
		*	A wave will be a number of asteroids fired in groups of 0-2 until the wave's asteroid count is met
		*	A wave is completed when all the asteroids have been destroyed

Add Cool stuff (sprint 2)
	*	Day/night sky
	*	Inclement weather
			Select weather types based on level, or
				use current weather from API
	*	Chondritic Asteroid
		*	A wave may contain a chondritic asteroid that breaks up in the atmosphere
		*	All the fragments must be destroyed

Game States

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

