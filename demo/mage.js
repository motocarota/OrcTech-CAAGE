// ========================================================
// Mage
// ========================================================
var _MAX_SHIELD = 10;

CAAT.Mage = function( ) {
	
	CAAT.Mage.superclass.constructor.call( this );
	this.mana = 100;
	this.cooldowns = {};
	this.spellIndex = 0;
	this.shield = 0;
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
		this.shieldRemoved();
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
	
	shieldActivated : function () {
		
		if ( _DEBUG ) CAAT.log( '[Mage] Shield up' );
		this.shield = _MAX_SHIELD;
		//add shield sprite
		if ( game.player.shieldSprite ) {
			game.player.shieldSprite.setVisible( true );
		} else {
			game.player.shieldSprite = new CAAT.Foundation.Actor( ).
				setPositionAnchor( 0.1, 0 ).
				setBounds( 10, 100, 180, 180 ).
				setBackgroundImage( new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'shield' ), 1, 1 ) ).
				enableEvents( false );
			game.bg.addActor( game.player.shieldSprite );
		}
		//trigger some sort of cooldown or it might be too easy to avoid damage 
	},
	
	shieldRemoved : function () {
		
		if ( _DEBUG ) CAAT.log( '[Mage] Shield destroyed' );
		this.shield = 0;
		//remove shield sprite
		if ( game.player.shieldSprite ) {
			game.player.shieldSprite.setVisible( false );
		}
	},
	
	damage : function ( amount, element ) {

		if ( _DEBUG ) CAAT.log('[Mage] receive '+amount+' points of '+element+" damage" );
		if ( this.shield > 0 ) {
			var delta = amount - this.shield;
			this.shield -= amount;
			amount = ( delta < 0 ) ? 0 : delta;
			if ( this.shield <= 0 ) {
				this.shieldRemoved();
			} else {
				game.player.notifyAt( 'absorb', this, 'white' );
			}
		}
		this.hp -= amount;
		
		if ( this.hp <= 0 ){
			this.hp = 0;
			this.die();
		}
		
		game.player.notifyAt( amount, this );
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