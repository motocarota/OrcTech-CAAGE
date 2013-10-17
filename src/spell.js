(function() {	
	
	var _DEBUG = 		false;
	var _SHOW_PATH = 	false;
	
	var _BASE_SPEED = 10000,
		_BASE_MULT_SPEED = 0.3;
	
	CAAT.Spell = function( id, x, y ){

		CAAT.Spell.superclass.constructor.call( this );

		this.level = 			1;
		this.cost = 			10;
		this.element =			"unknown";
		this.school =			"unknown";
		this.cooldown =			1;
		this.icon = 			null;
		this.targets =			{};
		this.travel = {
			speed: 				1,
			duration: 			500,
			rotation : 			false,
			interpolator:		null,
			image: 	{
				name: 			'base', 
				sprite: 		null,
				frame: 			{ h: 1, w: 1 },
				anchor : 		{ x: 0, y: 0 }
			},
			animation: {
				frames: 		[0],
				duration: 		500
			}
		};
		this.splash = {
			duration:			500,
			rotation : 			false,
			path:				null,
			image: {
				name: 			null,
				sprite: 		null,
				frame: 			{ h: 1, w: 1 },
				anchor : 		{ x: 0, y: 0 }
			},
			animation: {
				frames: 		[0],
				duration: 		500
			}
		};
	
		this.typeId = id || 0;
		this.dest = {
			x: x || director.width/2,
			y: y || director.height/2
		};
		this.setup( );

		return this;
	};
	
	CAAT.Spell.prototype = {
		
		setup : function( ){

			var name = game.spellList[ this.typeId ];
			
			if ( _DEBUG ) CAAT.log("[Spell] Setup ( "+this.typeId+" -> "+name+" ) -> ", game.spellBook[ name ] );

			var data = deepExtend( this, game.spellBook[ name ] );
			if ( data.initPath ){
				
				if ( _DEBUG ) CAAT.log( "[Spell] custom Path" );
				var c = data.initPath( this.dest.x, this.dest.y );
				this.travel.path = c[0];
				this.splash.path = c[1];
				
			} else {
				
				if ( _DEBUG ) CAAT.log( "[Spell] standard path" )
				this.travel.path = new CAAT.PathUtil.Path( ).
					setLinear( 
						game.player.x, game.player.y,
						this.dest.x, this.dest.y 
					);
			}
			
			if ( this.travel.anchor && this.travel.anchor.x && this.travel.anchor.y ) {
				this.setPositionAnchor( this.travel.anchor.x, this.travel.anchor.y );
			}
			
			if ( _DEBUG && _SHOW_PATH ) {
				gameScene.addChild( new CAAT.PathActor().
					setPath( this.travel.path ).
					setFrameTime( gameScene.time, this.travel.duration ).
					setBounds( 0, 0, director.width, director.height ).
					setInteractive( false )
				);
			}
			
			if ( data.initEffect ) {
				var c = data.initEffect( );
				this.travel.effect = c[0];
				this.splash.effect = c[1];
			} else {
				if ( _DEBUG ) CAAT.log( "[Spell] standard effect" );
				this.travel.effect = null;
				this.splash.effect = function ( target ) { 	
					if ( _DEBUG ) CAAT.log( "[Spell] Base effect applied on "+target.id );
				};
			}
			
			this.id = name+roll( 1, 999 );
			this.name = name;
		},
		
		
		add : function( ) {
			
			if ( _DEBUG ) CAAT.log("[Spell] Add "+this.id+" at ["+this.dest.x+","+this.dest.y+"]")
			
			this.travel.duration = this.travel.path.getLength() * this.travel.speed;
			
			this.travel.image.sprite = new CAAT.Foundation.SpriteImage( ).initialize( 
				director.getImage( this.travel.image.name ), 
				this.travel.image.frame.h, 
				this.travel.image.frame.w );
			
			this.setBackgroundImage( this.travel.image.sprite, true ).
				setFrameTime( gameScene.time, this.travel.duration+this.splash.duration ).
				setPositionAnchor( 0.5, 0.5 ).
				enableEvents( false );
			
			if ( this.travel.rotation ) {
				if ( is( "Number", this.travel.rotation ) ) {
					this.setRotation( this.travel.rotation )
				}
				// else { automatic rotation, based on missile direction }
			} else {
				this.setRotation( 0 );
			}
			
			var spell = this;
			var b = new CAAT.Behavior.PathBehavior( ).
				setAutoRotate( this.travel.rotation || true, CAAT.Behavior.PathBehavior.autorotate.LEFT_TO_RIGHT ).
				setPath( this.travel.path ).
				setFrameTime( gameScene.time, this.travel.duration ).
				addListener( {
					behaviorExpired : function( behaviour, time ) {
						spell.land();
					}
				} );
				
			if ( this.travel.interpolator ) {
				b.setInterpolator( this.travel.interpolator );
			}
			this.addBehavior( b );
			
			if ( _DEBUG ) CAAT.log("[Spell] Add : behaviorList ",this.behaviorList );
			
			var behaviours = this.initBehaviour ? 
				this.initBehaviour() : [];
			for ( b in behaviours[0] ) {
				this.addBehavior( behaviours[0][ b ] );
			}
			
			if ( _DEBUG ) CAAT.log("[Spell] Add : behaviorList-post ",this.behaviorList );
			
			if ( this.travel.animation ) {
				this.addAnimation( "travel", this.travel.animation.frames, this.travel.animation.duration );
				this.playAnimation( "travel" );
			}
			game.bg.addChild( this );
		},
		
		
		die: function ( amount ) {
			
			if( _DEBUG ) CAAT.log( "[Spell] "+this.id+' is now dead!' );
			this.setDiscardable(true).setExpired(true);
		},
		
		
		land: function ( ) {

			if( _DEBUG ) CAAT.log( "[Spell] "+this.id+' is landed!' );
			
			if ( this.splash.image && this.splash.image.name ) {
				this.splash.image.sprite = new CAAT.Foundation.SpriteImage( ).initialize( 
					director.getImage( this.splash.image.name ), 
					this.splash.image.frame.h || 1, 
					this.splash.image.frame.w || 1 );
				
				this.setBackgroundImage( this.splash.image.sprite ).
					setPositionAnchor( 0.5, 0.5 ).
					setPosition( this.dest.x, this.dest.y );
				
				if ( this.splash.anchor && this.splash.anchor.x && this.splash.anchor.y ) {
					this.setPositionAnchor( this.splash.anchor.x, this.splash.anchor.y );
				}

				if ( this.splash.rotation ) {
					if ( is( "Number", this.splash.rotation ) ) {
						this.setRotation( this.splash.rotation )
					}
				} else {
					this.setRotation( 0 );
				}
				
			} else {
				if ( _DEBUG ) CAAT.log('[Spell] No splash image found, keeping original');
			}
			
			if ( this.splash.animation ) {
				this.addAnimation( 
					"splash", 
					this.splash.animation.frames, 
					this.splash.animation.duration, 
					null
				);
				this.playAnimation( 'splash' );
			}
			
			var behaviours = this.initBehaviour ? 
				this.initBehaviour() : [];
			for ( b in behaviours[1] ) {
				this.addBehavior( behaviours[1][ b ] );
			}
			
			var that = this;
			if ( this.splash.effect ) {
				gameScene.createTimer(
					gameScene.time,
					this.splash.duration, 
					function(){ if ( _DEBUG ) CAAT.log("[Spell] No collision found for "+this.id ); },
					function( t, tt ){ that.checkCollisions( false ) },
					function(){ if ( _DEBUG ) CAAT.log("[Spell] Timer cancelled" ); }
				);
			}
		},
		
		checkCollisions: function( travel ) {

			if ( _DEBUG ) CAAT.log("[Spell] Check Collisions between "+this.id+" and "+game.enemies.length+" enemies" );
			var entitiesCollision = new CAAT.Module.Collision.QuadTree().create( 
				0, 0, 
				director.width  * ( game.options.cell_size || 20 ), 
				director.height * ( game.options.cell_size || 20 ), 
				game.enemies 
			);
			var src = travel ? this.travel : this.splash;
			var aoe = null;
			if ( src.AOE ) 
				aoe = src.AOE( this );
			
			var rect = { 
				x: ( aoe && aoe.x ) || this.x - ( this.width / 2 ),
				y: ( aoe && aoe.y ) || this.y - ( this.height / 2 ),
				w: ( aoe && aoe.w ) || this.width,
				h: ( aoe && aoe.h ) || this.height
			};
			var collide = entitiesCollision.getOverlappingActors( 
				new CAAT.Rectangle().setBounds( rect.x, rect.y, rect.w, rect.h )
			);
			
			if ( collide.length ) {
				for ( var i = collide.length - 1; i >= 0; i-- ) {
					if ( this.targets[ collide[i].id ] !== true ) {
						this.targets[ collide[i].id ] = true;
						src.effect( collide[i] );
						// if ( _DEBUG ) CAAT.log("[Spell] Collision found: "+this.id+" hits "+collide[i].id );
					}
				};
			}
			return false;
		}
	};
	
	extend( CAAT.Spell, CAAT.Actor );
})();