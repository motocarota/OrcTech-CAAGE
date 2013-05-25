
var _DEBUG = false;
var DEFAULT_NUM = 1,
	DEFAULT_DICE = 6,
	DEFAULT_BONUS = 0;

function baseSpellData() {
	
	// standar base spell to start with, every spell in the game is based on this
	return {
		level : 				1,
		cost : 					10,
		element: 				"undefined",
		school:					"undefined", 
		cooldown: 				1,
		icon: 					null,
		targets: 				{},
		travel : {
			duration: 			500,
			image: 	{
				name: 			'base', 
				sprite: 		null,
				frame: {
					h:			1,
					w:			1
				},
				anchor : {
					x : 		0,
					y : 		0
				},
				rotation : 		false
			},
			animation: {
				frames: 		[0],
				duration: 		500
			}
		},
		splash : {
			duration:			500,
			path:				null,
			interpolator:		null,
			image: {
				name: 			null,
				sprite: 		null,
				frame : {
					h : 		1,
					w : 		1
				},
				anchor : {
					x : 		0,
					y : 		0 
				},
				rotation : 		false
			},
			animation: {
				frames: 		[0],
				duration: 		500
			}
		}
	};
};
	
function roll( num, dice, bonus ){

	// Returns rolls NUM d DICE plus BONUS (ex. roll( 3, 6, 5 ) -> 3d6+5 )
	// if input arguments are not nice, default values will be used (1d6+0)

	// TODO
	// check args data type to avoid to return NaN values
	
	if ( _DEBUG ) console.log( '[Roll] Rolling '+num+"D"+dice+"+"+bonus+"... ");
	if ( num === undefined || num < 1 ) {
		if ( _DEBUG ) console.log("[Roll] warning: invalid number, used default ["+DEFAULT_NUM+"]");
		num = DEFAULT_NUM;
	}
	if ( dice === undefined || dice < 1 ) {
		if ( _DEBUG ) console.log("[Roll] warning: invalid dice, used default ["+DEFAULT_DICE+"]");
		dice = DEFAULT_DICE;
	}
	if ( bonus === undefined ) {
		if ( _DEBUG ) console.log("[Roll] warning: invalid bonus, used default ["+DEFAULT_BONUS+"]");
		bonus = DEFAULT_BONUS;
	}
	var total = 0, tmp = 0;
	for ( i=0; i< num; i++ ) {
		tmp = Math.floor( Math.random()*dice )+1;
		total += tmp;
		if ( _DEBUG ) console.log("[Roll] parial roll "+tmp);
	}
	total += bonus;
	if ( _DEBUG ) console.log( '[Roll] Rolling '+num+"D"+dice+"+"+bonus+"... "+total);
	
	return total;
}

/*
 * Objects Functions
*/

// DeepExtend from article : http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/ 
function deepExtend ( dest, src ) {
	
	for ( var prop in src ) {
		if ( src[ prop ] && typeof src[ prop ] === "object" && dest[ prop ] ) {
			dest[ prop ] = dest[ prop ] || {};
			deepExtend( dest[ prop ], src[ prop ] );
		} else {
			dest[ prop ] = src[ prop ];
		}
	}
	return dest;
}

/*
 * 	Array Functions
 */

function has( arr, value ) {
	
	for (var i=0; i < arr.length; i++) {
		if ( arr[i] === value ) 
			return true;
	}
	return false;
}

function count( arr, value ) {

	var n = 0;
	for (var i=0; i < arr.length; i++) {
		if ( arr[i] === value ) 
			n++;
	}
	return n;
}

function find( arr, value ) {
	
	for (var i=0; i < arr.length; i++) {
		if ( arr[i] === value ) 
			return i;
	}
	return -1;
}

function remove( arr, value ) {
	
	var index = find( arr, value );
	if ( index > -1 )
		arr.splice( index, 1 );
	return arr;
}

function clean( arr ) {
	
	// Cleans an array from empty and undefined elements
	// es. cleanArray ( [1,2,null, undefined,3,,3,,,0,,,4,,4,,5,,6,,,,] ) returns [1, 2, 3, 3, 4, 4, 5, 6]
	
	var temp = [];
	for ( i in arr )
	    arr[i] && temp.push( arr[i] );
	arr = temp.slice(0);

	return arr;
}

/*
 * Debug Utils
 */

function printEnemies(){
	console.log( "[PrintEnemies] lenght:"+game.enemies.length );
	for( e in game.enemies )
		console.log( game.enemies[e].id );
}