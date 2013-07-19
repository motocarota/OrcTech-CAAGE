(function() {	

	var _DEBUG = false;
	
	CAAT.Drop = function( ){
		CAAT.Enemy.superclass.constructor.call( this );
		return this;
	};
	
	CAAT.Drop.prototype = {

		id: 			0,
		x: 				0,
		y: 				0,
		age: 			0, 
		type:			'unknown',
		
		effect : function(){ 
			
			game.player.notify( 'Base drop effect' ); 
		},
		
		
		setup : function( type ){
			
			if ( !game.dropList ) return -1;
			this.type = type || game.dropList[ roll( 0, game.dropList.length ) ];
			this.id = this.type+roll( 1, 999 );
			
			var data = game.dropTable[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			if( _DEBUG ) CAAT.log( "[Drop] setup with type: "+type+" -> "+this.type );
		},
		
		
		add : function( type, x, y ) {
			
			this.x = x || roll( 1, director.width );
			this.y = y || roll( 1, director.height );
			if ( this.setup( type ) === -1 )
				return -1;
			
			var drop = this;
			var image = new CAAT.Foundation.SpriteImage( ).
				initialize( director.getImage( 'items' ), 2, 3 );

			this.setLocation( this.x, this.y ).
				setBackgroundImage( image ).
				setScale( 0.5, 0.5 ).
				setPositionAnchor( 0.5, 0.5 ).
				setSpriteIndex( this.imageId );
			
			var step = roll( 1, 10, 5 );
			var deltaY = roll( 1, step, step/2 );
			var deltaX = Math.random( ) < 0.5 ? roll( 1, step, step/2 ) : -1*roll( 1, step, step/2 );
			this.addBehavior( new CAAT.Behavior.PathBehavior().
					setFrameTime( gameScene.time, 500 ).
					setInterpolator( new CAAT.Behavior.Interpolator( ).createExponentialOutInterpolator( 5, false ) ).
					setPath( new CAAT.PathUtil.Path().
					beginPath( this.x, this.y ).
					addCubicTo( 
						this.x-deltaX, this.y-deltaY,
						this.x-deltaX, this.y-deltaY,
						this.x-( 2 * deltaX ), this.y+deltaX ).
					endPath()
				)
			);
			this.addBehavior( 
				new CAAT.Behavior.AlphaBehavior().
					setFrameTime( gameScene.time + ( game.options.drop.lifespan * game.options.global_cooldown ), game.options.drop.lifespan*30 ).
					setValues( 1, 0 ).
					addListener( {
						behaviorExpired : function( behaviour, time ) {
							drop.die();
						}
					} )
			);
			
			gameScene.addChild( this );
			if( _DEBUG ) CAAT.log( "[Drop] "+this.id+" is added" );
		},
		
		
		mouseUp: function( ev ) {
			
			if( _DEBUG ) CAAT.log( "[Drop] MouseUp on "+this.id );
			game.player.notify( 'You gain a new item: '+this.type+'!' );
			this.enableEvents( false ).
				playAnimation( 'pickup' ).
				effect();
			
			this.emptyBehaviorList();
			this.addBehavior( 
				new CAAT.Behavior.PathBehavior( ).
					setPath( new CAAT.PathUtil.Path( ).setLinear( this.x, this.y, game.player.x, game.player.y ) ).
					setFrameTime( gameScene.time, 900 )
			);
			this.addBehavior( new CAAT.Behavior.AlphaBehavior().
				setFrameTime( gameScene.time, 900 ).
				setValues( 1, 0 )
			);
		},
		
		die: function( amount ) {
			
			if( _DEBUG ) CAAT.log( "[Drop] you picked up "+this.id );
			this.setDiscardable(true).setExpired(true);
		},
		
		
		tick : function() {
			
			if( _DEBUG ) CAAT.log("[Drop] "+this.id+" tick");
			if( this.age++ > game.options.drop.lifespan ) {
				this.die();
			}
		}
	};
	
	extend( CAAT.Drop, CAAT.Actor );
})();