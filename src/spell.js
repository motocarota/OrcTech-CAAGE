(function() {	
	
	var _DEBUG = false;
	
	var _BASE_SPEED = 10000,
		_BASE_MULT_SPEED = 0.3;
	
	CAAT.Spell = function( id, x, y ){

		CAAT.Spell.superclass.constructor.call( this );

		this.level = 			1;
		this.cost = 			10;
		this.element =			"undefined";
		this.school =			"undefined";
		this.cooldown =			1;
		this.icon = 			null;
		this.targets =			{};
		this.travel = {
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
		};
		this.splash = {
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
				//NOTE we use these starting values for the path because we consider using position anchors set at 0, 0
				this.travel.path = new CAAT.PathUtil.Path( ).
					setLinear( 
						game.player.x + game.player.width/2, 
						game.player.y + game.player.height/2,
						this.dest.x, 
						this.dest.y 
					);
			}
		
			if ( data.initEffect ){
				
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
		
			this.travel.image.sprite = new CAAT.Foundation.SpriteImage( ).initialize( 
				director.getImage( this.travel.image.name ), 
				this.travel.image.frame.h, 
				this.travel.image.frame.w );
			
			this.setBackgroundImage( this.travel.image.sprite, true ).
				setFrameTime( gameScene.time, this.travel.duration+this.splash.duration ).
				setPositionAnchor( 0.5, 0.5 ).
				enableEvents( false );
					
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
			if ( this.splash.animation )
				this.addAnimation( "splash", this.splash.animation.frames, this.splash.animation.duration );
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
			} else {
				if ( _DEBUG ) CAAT.log('[Spell] No splash image found, keeping original');
			}
			if ( this.splash.animation ) {
				this.addAnimation( "splash", this.splash.animation.frames, this.splash.animation.duration, function ( s ){ s.setOffset( -100000, -100000 ); } );
				this.playAnimation( 'splash' );
			}
			var behaviours = this.initBehaviour ? 
				this.initBehaviour() : [];
			for ( b in behaviours[1] ) {
				this.addBehavior( behaviours[1][ b ] );
			}
			
			gameScene.createTimer(
				gameScene.time,
				this.splash.duration, 
				null,
				this.checkCollisions( ),
				null
			);
		},
		
		
		checkCollisions: function( ) {
			
			if ( _DEBUG ) CAAT.log("[Spell] Check Collisions between "+this.id+" and "+game.enemies.length+" enemies" );
			// var max = Math.max( director.width, director.height );
			var entitiesCollision = new CAAT.Module.Collision.QuadTree().create( 
				0, 0, 
				director.width  * ( game.options.cell_size || 20 ), 
				director.height * ( game.options.cell_size || 20 ), 
				game.enemies 
			);

			var collide = entitiesCollision.getOverlappingActors( 
				new CAAT.Rectangle().setBounds( 
					this.x - ( this.width / 2 ), 
					this.y - ( this.height / 2 ), 
					this.width, 
					this.height )
			);
			if ( collide.length ) {
				for ( var i = collide.length - 1; i >= 0; i-- ) {
					if ( this.targets[ collide[i].id ] !== true ) {
						this.targets[ collide[i].id ] = true;
						this.splash.effect( collide[i] );
						if ( _DEBUG ) CAAT.log("[Spell] Collision Found: "+this.id+" hits "+collide[i].id );
					}
				};
			} else {
				if ( _DEBUG ) CAAT.log("[Spell] No collision Found for "+this.id );
			}
		}
	};
	
	extend( CAAT.Spell, CAAT.Actor );
})();