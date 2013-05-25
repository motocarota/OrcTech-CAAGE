
(function() {	
	var _DEBUG = false;
	
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
		attackSpeed: 	6, 
		cooldown: 		6,
		element: 		"physical",
		range: 			false,
		label: 			null,
		
		setup : function( ){
			
			var data = game.enemiesBook[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			
			this.hp = roll( this.level, this.hitDice, this.level );
			this.id = this.type+roll( 1, 999 );
			this.speed = game.options.enemies.baseSpeed * ( 1 - ( data.speed ? data.speed : game.options.enemies.multSpeed ) );
			this.label = new CAAT.Foundation.UI.TextActor( );
			
		},
				
		add : function( type ) {
			
			var e = this;
			this.type = type;
			this.setup( );
			
			this.sprite = new CAAT.Foundation.SpriteImage().initialize( 
				director.getImage( this.type ), 
				this.frameH || 1, 
				this.frameW || 1 
			);
				
			var pbenemy= new CAAT.Behavior.PathBehavior().
				setFrameTime( gameScene.time, this.speed ).
				setInterpolator( new CAAT.Behavior.Interpolator().createLinearInterpolator(false) ).
				setPath( new CAAT.PathUtil.Path().setLinear( 
					director.width-50, 
					(director.height/4)+Math.random()*(director.height*3/4), 
					game.player.x +30, 
					game.player.y +roll( 1, 20 )) ).
				addListener( {
					behaviorExpired : function( behaviour, time ) {
						e.range = true;
					}
				} );

			if ( this.animations && this.animations.walk ) {
				if ( _DEBUG ) CAAT.log('[Enemy] Adding walk animation');
				this.sprite.addAnimation( 'walk', this.animations.walk.frames, this.animations.walk.duration );
			}
			if ( this.animations && this.animations.attack ) {
				if ( _DEBUG ) CAAT.log('[Enemy] Adding attack animation');
				this.sprite.addAnimation( 'attack', this.animations.attack.frames, this.animations.attack.duration );
			}

			this.setBackgroundImage( this.sprite, true ).
				enableEvents( false ).
				setPositionAnchor( 0.5, 0.5 ).
				addBehavior( pbenemy );
			
			game.bg.addChildAt( this, this.y );
			game.bg.addChild( this.label );
			
			this.index = game.enemies.push( this );
			this.playAnimation( 'walk' );
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is added" );

		},
				
		attack: function( ) { 
			
			this.cooldown = this.attackSpeed;
			this.target.damage( roll( this.level ), this.element );
			this.playAnimation( 'attack' );
			if ( _DEBUG ) CAAT.log( "[Enemy] "+this.id+" is attacking!" );
		},

		damage: function( amount, element ) {
			
			if ( this.damageFilter ) {
				amount = Math.round( this.damageFilter( amount, element ) );
			}
			if ( roll( 1, 20 ) === 20 )
				amount *= 2;
				
			if ( _DEBUG ) CAAT.log('[Enemy] '+this.id+' receives '+amount+' points of '+element+' damage ( hp: '+this.hp+' )');
	        this.hp = this.hp - amount;
	
			this.label.
				setFont("26px "+game.options.font ).
				setLocation( this.x, this.y ).
				setText( "-"+amount ).
				setTextFillStyle( "yellow" );
				
			this.label.addBehavior( 
				new CAAT.Behavior.AlphaBehavior().
					setFrameTime( gameScene.time, 900 ).
					setValues( 1, 0 ) 
			);
			
			this.label.addBehavior( 
				new CAAT.Behavior.PathBehavior( ).
					setPath( new CAAT.PathUtil.Path( ).setLinear( this.x, this.y-20, this.x, this.y-40 ) ).
					setFrameTime( gameScene.time, 900 )
			);
	
			if ( this.hp <= 0 ){ 
				this.die();
			}
	    },
	
		die: function( amount ) {
			
			if( _DEBUG ) CAAT.log( "[Enemy] "+this.id+' is now dead!' );
			this.label.setDiscardable(true).setExpired(true);
			this.setDiscardable(true).setExpired(true);
			for ( var i = game.enemies.length - 1; i >= 0; i-- ) {
				if ( game.enemies[i].id === this.id ) {
					game.enemies.splice( i, 1 );
					game.killCount++;
					return true;
				}
			}
			return false;
		},
		
		tick : function() {
			
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" tick");
			if ( this.cooldown-- <= 0 && this.range ){
				this.attack(); 
			}
		}
	};
	
	extend( CAAT.Enemy, CAAT.Actor );
})();