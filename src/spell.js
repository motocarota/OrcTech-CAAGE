(function() {	
	
	var _DEBUG = false;
	var _BASE_SPEED = 10000,
		_BASE_MULT_SPEED = 0.3;
	
	CAAT.Spell = function( id, x, y ){

		CAAT.Spell.superclass.constructor.call( this );

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
			var data = deepExtend( baseSpellData(), game.spellBook[ name ] );
			
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			
			if ( data.initPath ){
				
				if ( _DEBUG ) CAAT.log( "[Spell] custom Path" );
				var c = data.initPath( this.dest.x, this.dest.y );
				this.travel.path = c[0];
				this.splash.path = c[1];
				
			} else {
				
				if ( _DEBUG ) CAAT.log( "[Spell] standard path" )
				this.travel.path = new CAAT.PathUtil.Path( ).
					setLinear( game.player.x, game.player.y, this.dest.x, this.dest.y );
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
				gameScene.checkCollisions( this ),
				null
			);
		}
	};
	
	extend( CAAT.Spell, CAAT.Actor );
})();