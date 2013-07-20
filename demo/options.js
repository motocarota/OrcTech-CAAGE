function setupOptions( ) {
	
	game.options = {
		max_hp: 			100,
		volume :			10,
		font :				"26px Arial",
		cell_size: 			30,
		global_cooldown :	50,		// determine how often the game calls the tick() method
		player: {
			startingX: 		80,
			startingY: 		180,
			max_mana: 		100,
			tick_mana: 		5 
		},
		enemies : {
			spawnRate: 		0.5,
			maxNumber: 		10,
			wave: 			60, 	// How many enemies spawn until the game is over
			baseSpeed : 	100 	// base enemy speed
		}
	};
};