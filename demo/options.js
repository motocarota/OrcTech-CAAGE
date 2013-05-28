function setupOptions( ) {
	
	game.options = {
		max_hp: 			100,
		volume :			10,
		font :				"Arial",
		cell_size: 			30,
		tick_time :			40, 	// change this to determine how often the game should call tick() method
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
			baseSpeed : 	50000 	// base enemy speed
		}
	};
}
