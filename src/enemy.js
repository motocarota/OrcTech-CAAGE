(function() {	
	
	var _DEBUG = 		true,
 		_SHOW_PATH = 	false;
window.bff = [];
	
	CAAT.Enemy = function( ){
		CAAT.Enemy.superclass.constructor.call( this );		
		this.target = game.player;
		return this;
	};
	
	CAAT.Enemy.prototype = {

		id: 			0,
		index: 		   -1,
		level:			1,
		hitDice:		6,
		hp: 			10, 
		type:			'unknown',
		speed: 			0.5, 
		attackSpeed: 	6, 
		cooldown: 		6,
		element: 		"physical",
		range: 			200,
		moving: 		false,
		dropTable: 		null,
		
		
		setup : function( ){
			
			var data = game.enemiesBook[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			this.buffs = [];
			this.modifiers = { hp: 0, speed: 0 }; 
			this.hp = roll( this.level, this.hitDice, this.level );
			this.id = this.type+roll( 1, 999 );
			this.speed = Math.floor( game.options.enemies.baseSpeed * ( 1 - ( data.speed ? data.speed : 0.5 ) ) );			
		},
		
		getHp: function(){
			return this.hp + this.modifiers.hp;
		},
		
		getSpeed: function(){
			return this.speed + this.modifiers.speed;
		},
		
		add : function( type ) {
			
			this.type = type;
			this.setup( );
			
			this.x = director.width + this.width;
			this.y = (director.height/4)+Math.random()*(director.height*3/4);
			
			this.sprite = new CAAT.Foundation.SpriteImage().initialize( 
				director.getImage( this.type ), 
				this.frameH || 1, 
				this.frameW || 1 
			);
			
			if ( this.animations && this.animations !== {} ){
				
				var a = null;
				
				for ( id in this.animations ) {
					a = this.animations[ id ];
					if ( a ) {
						if ( id === 'attack' && !a.reset ) {
							a.reset = function ( s ) { s.playAnimation( 'stand' ) };
						}
						this.sprite.addAnimation( id, a.frames, a.duration, a.reset );
					}
				}
			}
			
			this.setBackgroundImage( this.sprite, true ).
				enableEvents( false ).
				setPositionAnchor( 0.5, 0.5 );
			
			// These lines should place a z-order for the actor, but it looks like they don't work at all
			game.bg.addChildAt( this, this.y );
			// game.bg.addChild( this );
			// game.bg.setZOrder( this.y );
			
			this.index = game.enemies.push( this );
			this.playAnimation( 'stand' );
			
			
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is added" );
		},
		
		halt: function () {
			
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" halts at "+this.x+","+this.y );
			this.emptyBehaviorList( );
			moving = false;
			this.playAnimation( 'stand' );
		},
		
		move: function ( x, y ) {
			
			var dest = {};
			if ( this.target ) {
				dest.x = x || this.target.x + this.target.width/2 + roll( 0, 15 );
				dest.y = y || this.target.y + this.target.height/4 + roll( 1, this.target.height/2 );
			}
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is moving to "+dest.x+","+dest.y );
			
			this.path = new CAAT.PathUtil.Path().setLinear( 
				this.x, this.y, 
				dest.x, dest.y
			);
			
			var t = getDistance( this, dest )*this.getSpeed();
			var e = this;
			this.pathBehavior = new CAAT.Behavior.PathBehavior().
				setFrameTime( gameScene.time, t ).
				setInterpolator( new CAAT.Behavior.Interpolator().createLinearInterpolator(false) ).
				setPath( this.path ).
				addListener( {
					behaviorExpired : function( behaviour, time ) {
						e.attack( );
					}
				} 
				);
			
			this.addBehavior( this.pathBehavior );
			moving = true;
			this.playAnimation( 'walk' );
		},
		
		
		attack: function( ) { 
			
			if ( this.range > getDistance( this, this.target ) ) {
				
				this.halt( );
				this.target.damage( roll( this.level ), this.element );
				this.cooldown = this.attackSpeed;
				this.playAnimation( 'attack' );
			
				if ( _DEBUG ) CAAT.log( "[Enemy] "+this.id+" is attacking!" );
			}
		},
		
		
		damage: function( amount, element ) {
			
			if ( this.damageFilter ) {
				amount = Math.round( this.damageFilter( amount, element ) );
			}
			if ( _DEBUG ) CAAT.log('[Enemy] '+this.id+' receives '+amount+' points of '+element+' damage ( hp: '+this.getHp()+' )');
			this.hp = this.getHp() - amount;
			game.player.notifyAt( amount, this );
			if ( this.getHp() <= 0 ){ 
				this.die();
			}
	    },
		
		
		die: function( amount ) {
			
			if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+' is now dead!' );
			// this.playAnimation( 'die' );
			for ( var i = game.enemies.length - 1; i >= 0; i-- ) {
				if ( game.enemies[i].id === this.id ) {
					game.enemies.splice( i, 1 );
					game.killCount++;
					game.bg.removeChild( this );
					
					if ( !this.dropTable ) return;
					for ( i in this.dropTable ) {
						var item = this.dropTable[ i ];
						if ( roll( 1, 100 ) < item.chance ) {
							var drop, qty;
							qty = roll( 1, item.qty || 1 );
							for ( var i=0; i < qty; i++ ) {
								new CAAT.Drop().add( item.id, this.x, this.y );
							}
						}
					}
					return true;
				}
			}
		},
		
		
		ai: function() {
			
			this.move();
		},
		
		addBuff: function( b ) {
			//if( b.isHarmful() ) try to resist to it
			if( _DEBUG ) CAAT.log( "[Enemy] added a buff: ", b );
			b.setTarget( this );
			this.buffs.push( b );
		},
		
		tick : function() {
			
			if ( this.cooldown-- <= 0 ) {
				this.attack( );
			}
			
			for ( var i=0; i < this.buffs.length; i++ ) {
				
				if ( this.buffs[i].isActive() ) {
					this.buffs[i].tick();
					if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+"'s buff "+i+" ticks..." );
				} else {
					this.buffs.splice( i, 1 );
					if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+"'s buff "+i+" ends" );
				}
			}
			
			if ( _DEBUG && _SHOW_PATH ) {
				game.bg.addChild( new CAAT.PathActor().
					setPath( this.path ).
					setFrameTime( gameScene.time, 400 ).
					setBounds( 0, 0, director.width, director.height ).
					setInteractive( false )
				);
			}
		}
	};
	
	extend( CAAT.Enemy, CAAT.Actor );
})();