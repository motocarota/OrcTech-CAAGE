
/*
 *
 * 		Graveyard demo - OrcTech CAAGE - Simone Poggi 2013
 * 	
 * 	This is a simple demo to show how to do nice stuff with this game engine
 * 	A serious documentation about this is coming out soon(tm)
 *
 */

// ========================================================
// Spells
// ========================================================
game.spellList = [ 'magic missile', 'fireball' ];
game.spellBook = {
	'magic missile':{

		level: 			1,
		cost: 			10,
		element: 		"force",
		school:			"invocation", 
		cooldown: 		0,
		
		travel : {
			duration: 		800,
			image: 	{
				name: 		'mmissile',
				frame: { w: 4, h:1 }
			}
		},
		splash: {
			duration: 		500,
			animation: {
				frames: [1,2,3], duration: 120
			}
		},
		
		initEffect : function(  ){
			return [
				null,
				function( target ){
					target && target.damage( roll( 1, 6, 1 ), 'force' );
					return true;
				}
			];
		},

		initPath: function ( x, y ) {
			return [ 
				new CAAT.PathUtil.Path( ).
					beginPath( game.player.x +game.player.width/2, game.player.y ).
					addCubicTo( 
						Math.random() * director.width, 
						Math.random() * director.height, 
						Math.random() * director.width * 1.5, 
						( Math.random() * director.height * 1.3 ) - director.height * 0.5, 
						x, y ).
					endPath(),
				null
			]
		}

	},
	
	'fireball': {
		level: 			3,
		cost: 			25, 
		cooldown: 		5,
		element: 		"fire",
		school: 		"invocation", 
		
		travel: {
			duration: 	2000,
			image: 	{
				name: 	'fb-travel',
				frame: { w: 2, h: 2 }
			},
			animation: {
				frames: [0,1,2,3,0,2,3,1], duration: 100
			}
		},
		
		splash : {
			duration: 		1000,
			rotation: 		false,
			// rotation: 		45,
			image : {
				name : "fb-splash",
				frame: { w: 3, h: 2 }
			},
			animation: {
				frames: [0,1,2,3,4,5], duration: 100
			}
		},
		
		initEffect : function(  ){
			return [ 
				null,
				function( target ){
					target && target.damage( roll( 5, 6 ), 'nature' );
					return true;
				}
			];
		}
	}
};

// ========================================================
// Enemies
// ========================================================

game.enemiesList = [ 'zombie', 'skeleton', 'wraith' ];
game.enemiesBook = {
	
	zombie: {
		level: 4,
		speed: 0.5,
		frameW: 4, 
		frameH: 2,
		animations: {
			stand: {
				frames: [0], duration: 300
			},
			walk: {
				frames: [0,1,2,3], duration: 300
			},
			attack: {
				frames: [4,5,6,7,0,0,0,0], duration: 200
			}
		},
		damageFilter: function( amount ) {
			return amount *1.5;
		}
	},
	
	skeleton: {
		level: 1,
		speed: 0.75,
		frameW: 4, 
		frameH: 2,
		animations: {
			stand: {
				frames: [4], duration: 300
			},
			walk: {
				frames: [0,1,2,3], duration: 200
			},
			attack: {
				frames: [4,5,6,7], duration: 150
			}
		},
		damageFilter: function( amount ) {
			return amount /2;
		}
	},
	
	wraith: {
		level: 6,
		speed: 0.25
	}
	
};