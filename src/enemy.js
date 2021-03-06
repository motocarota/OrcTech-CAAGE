(function() {	

	var _DEBUG = 		false,
 		_SHOW_PATH = 	false;
	
	CAAT.Enemy = function( ){
		CAAT.Enemy.superclass.constructor.call( this );		
		this.target = game.player;
		return this;
	};
	
	CAAT.Enemy.prototype = {

		id:				0,
		index:			-1,
		level:			1,
		hitDice:		6,
		hp:				10,
		wounds: 		0,
		type:			'unknown',
		role: 			"melee", 
		speed:			1, 
		attackSpeed:	6,
		cooldown:		6,
		element:		"physical",
		range:			150,
		moving:			false,
		dropTable:		null,
		tick_done:		0,
		regeneration: 	0,
		summoned:		false,
		_dest:			{ x:0, y:0 },
		_t:				0,
		
		
		setup : function( ) {
			
			var data = game.enemiesBook[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			this.buffs = [];
			this.modifiers = { hp: 0, speed: 0 }; 
			this.hp = roll( this.level, this.hitDice, this.level );
			this.id = this.type+roll( 1, 999 );
		},
		
		
		add : function( type, opts ) {
			
			this.type = type;
			opts = opts || {};
			this.opts = opts.summoned;
			this.setup( );
			
			this.x = opts.x || director.width + this.width;
			this.y = opts.y || ( director.height/4 )+Math.random()*( director.height*3/4 );
			
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
			
			this.hpBar = new CAAT.Foundation.Actor( ).
				setFillStyle( '#F00' ).
				setSize( game.options.enemies.bar_width, game.options.enemies.bar_height ).
				setPositionAnchor( 0.5, 0 ).
				setLocation( this.width/2, 0 );
			this.addChild( this.hpBar );
			
			game.bg.addChild( this );
			this.index = game.enemies.push( this );
			this.playAnimation( 'stand' );
			
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is added" );
		},
		
		
		getDamage: function( ) { 
			
			var bonus = 0;
			var malus = 0;
			for ( b in this.buffs ) {
				var amt = this.buffs[b].modDamage || null;
				 if ( amt && is( 'Number', amt ) ) {
					if ( this.buffs[b].harmful ){
						malus = malus > amt ? malus : amt;
					} else {
						bonus = bonus > amt ? bonus : amt;
					}
				 }
			}
			return roll( 2, this.level, ( bonus-malus ) ); 
		},
		
		
		getHp: function(){
			
			var mods = [0];
			return this.hp - this.wounds + _.max( mods );
		},
		
		/*
			getSpeed()
			returns the current speed of the entity
			
			to calculate the speed multiplier:
			1. only the most strong buff counts, ex:
				speedBuffs= [ 1.1, 1.1, 1.2, 1.5 ] my resulting speed will be 1.5x
				speedBuffs= [ 0.2, 0.9, 0.3 ] my resulting speed will be 0.2x
				
			2. with Buffs with opposite sign, you subtract the resulting multipliers in both signs
				speedBuffs= [ 0.3, 1.5 ] my resulting speed will be +1.5 -( 1 -0.3 ) = 1,5 - 0.7 = 0.8x
				speedBuffs= [ 0.9, 1.2, 1.9 ] my resulting speed will be +1.9 -( 1 -0.9 ) = 1,9 - 0.1 = 1.8x
		*/
		
		getSpeed: function(){
			
			var mods = [ this.speed ];
			for ( b in this.buffs ) {
				 if ( this.buffs[b].modSpeed ) {
					 mods.push( this.buffs[b].modSpeed );
				 }
			}			
			var speed_mult = _.max( mods ) - ( this.speed - _.min( mods ) );
			return speed_mult;
		},
		
		
		refreshSpeed: function() {
			
			if ( _DEBUG ) CAAT.log( '[Enemy] '+this.id+' refresh his speed' );
			this.move( );
		},
		
		
		halt: function () {
			
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" halts at "+this.x+","+this.y );
			this.moving = false;
			this.playAnimation( 'stand' );
			this.emptyBehaviorList();
		},
		
		
		move: function ( x, y ) {
			
			this.emptyBehaviorList();
			
			if ( x && y ){
				this._dest.x = x;
				this._dest.y = y;
			}
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is moving to "+this._dest.x+","+this._dest.y );
			
			this.path = new CAAT.PathUtil.Path().setLinear( 
				this.x, this.y, this._dest.x, this._dest.y
			);
			this._t = ( game.options.enemies.baseSpeed * this.path.getLength() / this.getSpeed() );
			var e = this;
			this.pathBehavior = new CAAT.Behavior.PathBehavior().
				setFrameTime( gameScene.time, this._t ).
				setInterpolator( new CAAT.Behavior.Interpolator().createLinearInterpolator(false) ).
				setPath( this.path ).
				addListener( {
					behaviorExpired : function( behaviour, time ) {
						e.moving = false;
						e.playAnimation( 'stand' );
					}
				} );
			
			this.addBehavior( this.pathBehavior );
			this.moving = true;
			this.playAnimation( 'walk' );
		},
		
		
		say: function( text, color ) {
			if ( _DEBUG ) CAAT.log( '[Enemy] '+this.id+' says: "'+text+'"' );
			game.player.notifyAt( text, this, color );
		},
		
		
		attack: function( amount ) { 
			
			if ( this.cooldown-- > 0 ) {
				return;
			} else {
				this.cooldown = this.attackSpeed;
			}
			
			if ( !amount ) {
				amount = this.getDamage();
			}
			this.target.damage( this.getDamage(), this.element );
			this.playAnimation( 'attack' );
			if ( _DEBUG ) CAAT.log( "[Enemy] "+this.id+" is attacking "+this.target+" for "+amount+" damage!" );
		},
		
		
		damage: function( amount, element ) {
			
			if ( this.damageFilter ) {
				amount = Math.round( this.damageFilter( amount, element ) );
			}
			this.wounds += amount;
			this.say( amount );
			if ( this.wounds > this.hp ) {
				this.die( true );
			}
			var percentage = game.options.enemies.bar_width * this.getHp() / this.hp;
			this.hpBar.setSize( percentage, game.options.enemies.bar_height );
			if ( _DEBUG ) CAAT.log( '[Enemy] '+this.id+' receives '+amount+' hp of '+element+' damage ( status: '+this.wounds+'/'+this.hp+' )' );
		},
		
		
		heal: function( amount ) {
			
			if ( _DEBUG ) CAAT.log( '[Enemy] '+this.id+' heals '+amount+' hp' );
			this.wounds -= amount;
			if ( this.wounds < 0 ){
				this.wounds = 0;
			}
			var percentage = game.options.enemies.bar_width * this.getHp() / this.hp;
			this.hpBar.setSize( percentage, game.options.enemies.bar_height );
			this.say( '+'+amount, '#9f0' );
		},
		
		
		die: function( drop ) {
			
			if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+' is now dead!' );
			// this.playAnimation( 'die' );
			for ( var i = game.enemies.length - 1; i >= 0; i-- ) {
				if ( game.enemies[i].id === this.id ) {
					game.killCount++;
					CAAT.log('killed an enemy: '+game.killCount)
					game.enemies.splice( i, 1 );
					game.bg.removeChild( this );
					
					if ( drop && _.has( this, 'dropTable' ) ) {
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
					} else {
						return false;
					}
				}
			}
		},
		
		
		getDistance: function( entity ){
			
			if ( !entity ) {
				entity = this.target;
			}
			return getDistance( this, entity );
		},
		
		
		ai: function() {
		
			if ( this.range < this.getDistance( ) || this.cooldown > 0 ) {
				if ( !this.moving ) {
					this.move( this.target.x + this.target.width/2, this.target.y + this.target.height/4 + roll( 1, this.target.height/2 ) );
				}
			} else {
				this.attack( this.getDamage() );
			}
		},
		
		
		addBuff: function( buff ) {
			
			if( _DEBUG ) CAAT.log( "[Enemy] added a buff: ", buff );
			buff.setTarget( this );
			//TODO resistances
			// if( buff.isHarmful() && buff.allowResist() && roll( 1, 100 ) > this.resistances[ buff.element ] ) { return; }
			this.buffs.push( buff );
		},
		
		
		tick : function() {
			
			this.tick_done++;
			this.ai();
			
			if ( this.cooldown > 0 ) {
				this.cooldown--;
			}
			
			if ( this.tick_done % this.attackSpeed === 0 ) {
				this.regeneration > 0 && this.heal( this.regeneration );
			}
			
			for ( var i=0; i < this.buffs.length; i++ ) {
				if ( this.moving && this.buffs[i].modSpeed ) {
					if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+"'s buff "+i+" changes target's speed" );
					// this.move( this._dest.x, this._dest.y );
				}
				if ( this.buffs[i].isActive() ) {
					this.buffs[i].tick();
					if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+"'s buff "+i+" ticks..." );
				} else {
					this.buffs.splice( i, 1 );
					this.refreshSpeed();
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
	extend( CAAT.Enemy, CAAT.ActorContainer );
	
	CAAT.RangedEnemy = function( ){
		CAAT.RangedEnemy.superclass.constructor.call( this );
		return this;
	};
	
	CAAT.RangedEnemy.prototype = {};
	extend( CAAT.RangedEnemy, CAAT.Enemy );
})();