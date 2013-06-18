// ========================================================
// Mage
// ========================================================

CAAT.Mage = function( ) {
	
	CAAT.Mage.superclass.constructor.call( this );
	this.mana = 100;
	this.cooldowns = {};
	this.spellIndex = 0;
	this.image = {
		name: 	'player',
		frameH: 1,
		frameW: 5
	};
	this.animations = {
		cast: 	{ 
			frames: [0,1,2,3], duration: 200, reset: function( s ){ s.playAnimation( 'stand' ); } 
		}
	}
	return this;
}

CAAT.Mage.prototype = {
	
	castSpell : function ( id, x, y ) {
		
		if ( _DEBUG ) CAAT.log('[Player] casts a spell id:'+id+' at( '+x+','+y+' )');
		var spell = null;
		
		if ( !this.cooldowns[ id ] || this.cooldowns[ id ] < 0 ) {
			this.playAnimation("cast");
			spell = new CAAT.Spell( id, x, y );	
			if ( this.mana > spell.cost ) {
				spell.add( );
				this.mana -= spell.cost;
				this.cooldowns[ id ] = spell.cooldown;
			} else { 
				CAAT.log( "[Player] out of mana "+this.mana+" / "+spell.cost )
				game.player.notify('Out of mana!');
			}
		} else {  
			if ( _DEBUG ) CAAT.log('[Player] cant cast because the spell is in cooldown '+this.cooldowns[ id ] );
			game.player.notify('Spell in cooldown!');
		}
		return spell;
	},
	
	tick: function() {
		for ( c in this.cooldowns ){
			this.cooldowns[ c ]--;
		}
		this.mana = ( this.mana < game.options.player.max_mana ) ? 
			this.mana + game.options.player.tick_mana : 
			game.options.player.max_mana;
	}
};

extend( CAAT.Mage, CAAT.Player );