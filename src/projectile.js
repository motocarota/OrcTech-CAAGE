(function() {	
	
	var _DEBUG = true;
	var _SHOW_PATH = false;
	
	CAAT.Projectile = function( id ) {
		
		CAAT.Projectile.superclass.constructor.call( this );
		this.typeId = id;
		this.caster = null;
		this.target = null;
		this.x = 0;
		this.y = 0;
		this.speed = 1;
		this.travelDuration = 1000;
		this.frameW = 1;
		this.frameH = 1;
		return this;
	}
	
	CAAT.Projectile.prototype = {
		
		
		setup : function( caster ){
			
			var name = game.projList[ this.typeId ];
			this.setCaster( caster );
			
			if ( _DEBUG ) CAAT.log("[Projectile] Setup ( "+this.typeId+" -> "+name+" )" );
			var data = deepExtend( this, game.projBook[ name ] );
			
			if ( data.initPath ){
				if ( _DEBUG ) CAAT.log( "[Projectile] setup: custom Path" );
				this.path = data.initPath( this.caster.x, this.caster.y, this.target.x, this.target.y );
			} else {
				if ( _DEBUG ) CAAT.log( "[Projectile] setup: standard path" )
				this.path = new CAAT.PathUtil.Path( ).
					setLinear( this.caster.x, this.caster.y, this.target.x, this.target.y );
			}
			
			if ( data.initEffect ) {
				if ( _DEBUG ) CAAT.log( "[Projectile] setup: custom Effect" );
				this.effect = data.initEffect( );
			} else {
				if ( _DEBUG ) CAAT.log( "[Projectile] setup: standard effect" )
			}
			
			this.id = name+roll( 1, 999 );
			this.name = name;
		},
		
		
		setCaster : function( c ) {
			
			if ( c ) {
				this.caster = c;
				this.x = c.x;
				this.y = c.y;
				this.target = c.target;
			} else {
				if ( _DEBUG ) CAAT.log( "[Projectile] setCaster: no caster" );
				this.caster = null;
			}
		},
		
		
		effect : function( ) {
			
			if( _DEBUG ) CAAT.log( "[Projectile] "+this.id+' effect procced on '+this.target+'!' );
			this.target.damage( this.damage );
		},
		
		
		land : function ( ) {
			
			if( _DEBUG ) CAAT.log( "[Projectile] "+this.id+' is landed!' );
			this.effect();
			this.die();
		},
		
		
		add : function( ) {
			
			if ( _DEBUG ) CAAT.log("[Projectile] Add "+this.id+" from: "+this.caster.id+" to: "+this.target.id );
			this.sprite = new CAAT.Foundation.SpriteImage( ).initialize( 
				director.getImage( this.name ), 
				this.frameH, 
				this.frameW
			); 
			this.travelDuration = this.path.getLength() * this.speed;
			this.setBackgroundImage( this.sprite, true ).
				setFrameTime( gameScene.time, this.travelDuration ).
				setPositionAnchor( 0.5, 0.5 ).
				enableEvents( false );
			
			if ( _DEBUG && _SHOW_PATH ) {
				gameScene.addChild( new CAAT.PathActor().
					setPath( this.path ).
					setFrameTime( gameScene.time, this.travelDuration ).
					setBounds( 0, 0, director.width, director.height ).
					setInteractive( false )
				);
			}
			
			var proj = this;
			var b = new CAAT.Behavior.PathBehavior( ).
				setAutoRotate( true, CAAT.Behavior.PathBehavior.autorotate.LEFT_TO_RIGHT ).
				setPath( this.path ).
				setFrameTime( gameScene.time, this.travelDuration-50 ). //bad practice, I know...
				addListener( {
					behaviorExpired : function( behaviour, time ) {
						proj.land();
					}
				} );
			this.addBehavior( b );
			game.bg.addChild( this );
		},
		
		
		die: function ( amount ) {
			
			if( _DEBUG ) CAAT.log( "[Projectile] "+this.id+' is now dead!' );
			this.setDiscardable(true).setExpired(true);
		}
	};
	
	extend( CAAT.Projectile, CAAT.Actor );
})();