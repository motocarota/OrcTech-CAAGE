(function() {	
	
	var _DEBUG = 		false;
	var _SHOW_PATH = 	false;
	
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
		range: 			200,
		label: 			null,
		moving: 		false,
		
		
		setup : function( ){
			
			var data = game.enemiesBook[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			
			this.x = director.width + this.width;
			this.y = (director.height/4)+Math.random()*(director.height*3/4);
			this.hp = roll( this.level, this.hitDice, this.level );
			this.id = this.type+roll( 1, 999 );
			this.speed = Math.floor( game.options.enemies.baseSpeed * ( 1 - ( data.speed ? data.speed : 0.5 ) ) );
			this.label = new CAAT.Foundation.UI.TextActor( );
			
		},
		
		
		add : function( type ) {
			
			this.type = type;
			this.setup( );
			
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
						// if ( _DEBUG ) CAAT.log('[Enemy] '+this.id+' has now '+id+' animation');
						if ( id === 'attack' ) {
							this.sprite.addAnimation( id, a.frames, a.duration, function ( s ) { s.playAnimation( 'stand' ) } );
						} else {
							this.sprite.addAnimation( id, a.frames, a.duration, a.reset );
						}
					}
				}
			}
			
			this.setBackgroundImage( this.sprite, true ).
				enableEvents( false ).
				setPositionAnchor( 0.5, 0.5 );
			
			game.bg.addChildAt( this, this.y );
			game.bg.addChild( this.label );
			
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
				dest.x = x || this.target.x + this.target.width/2;
				dest.y = y || this.target.y + roll( 1, this.target.height );
			}
			if( _DEBUG ) CAAT.log("[Enemy] "+this.id+" is moving to "+dest.x+","+dest.y );
			
			this.path = new CAAT.PathUtil.Path().setLinear( 
				this.x, this.y, 
				dest.x, dest.y
			);
			
			var t = getDistance( this, dest )*this.speed;
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
			
			if ( !moving && this.cooldown-- <= 0 ) {
				this.attack( );
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