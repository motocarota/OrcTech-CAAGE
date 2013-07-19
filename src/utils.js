
var _DEBUG = false,
	_VERBOSE = false;
var DEFAULT_NUM = 1,
	DEFAULT_DICE = 6,
	DEFAULT_BONUS = 0;
	
function getDistance ( en0, en1 ) {

	if ( !en0 || !en1 ) {
		CAAT.log( '[Utils] getDistance: bad arguments: ',en0, en1 );
		return -1;
	}
	var dx = en0.x - en1.x;
	var dy = en0.y - en1.y;
	return Math.floor( Math.sqrt( dx*dx + dy*dy ) );
}

function roll( num, dice, bonus, crit_mult ){

	// Returns rolls NUM d DICE plus BONUS (ex. roll( 3, 6, 5 ) -> 3d6+5 )
	// if critical_mult arg is set, it will multiply your result if roll(1, 20) === 20
	// if input arguments are not nice, default values will be used (1d6+0)
	// if num = 0 the number returned will be in the range 0..dice-1 (ex. roll(0, 3) -> 1d4-1 useful for array cycling)
	if ( is( "Array", num ) ) {
		return Math.floor( Math.random()*num.length );
	}
	if ( _DEBUG && _VERBOSE ) console.log( '[Roll] Rolling '+num+"D"+dice+"+"+bonus+"... ");
	if ( num === undefined || num < 0 || !is( 'Number', num ) ) {
		if ( _DEBUG && _VERBOSE ) console.log("[Roll] warning: invalid number, used default ["+DEFAULT_NUM+"]");
		num = DEFAULT_NUM;
	}
	if ( dice === undefined || dice < 1 || !is( 'Number', dice ) ) {
		if ( _DEBUG && _VERBOSE ) console.log("[Roll] warning: invalid dice, used default ["+DEFAULT_DICE+"]");
		dice = DEFAULT_DICE;
	}
	if ( bonus === undefined || !is( 'Number', bonus ) ) {
		if ( _DEBUG && _VERBOSE ) console.log("[Roll] warning: invalid bonus, used default ["+DEFAULT_BONUS+"]");
		bonus = DEFAULT_BONUS;
	}
	var total = 0, tmp = 0;
	if ( num === 0 ) {
		total = Math.floor( Math.random()*dice );
	} else {
		for ( i=0; i< num; i++ ) {
			tmp = Math.floor( Math.random()*dice )+1;
			total += tmp;
			if ( _DEBUG && _VERBOSE ) console.log("[Roll] parial roll "+tmp);
		}
	}
	if ( crit_mult && is( 'Number', crit_mult ) && roll( 1, 20 ) === 20 ) {
		if ( _DEBUG ) console.log("[Roll] Critical Hit! "+crit_mult+"x damage!" );
		total = total * crit_mult;
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

/*
 * IS function: determine if an Object is of the same type given by argument
 * ex. 
 * 		is( "String", 12 ) -> returns false 	
 * 		is( "Number", 12 ) -> returns true
 * 		etc. 	
 */

function is( type, obj ) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}