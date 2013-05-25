
(function() {	
	var _DEBUG = true;
	
	CAAT.Drop = function( ){
		CAAT.Enemy.superclass.constructor.call( this );
		return this;
	};
	
	CAAT.Drop.prototype = {

		id: 			0,
		level:			1,
		x: 				0,
		y: 				0,
		age: 			0, 
		type:			'unknown',
		
		effect : function(){ 
			
			game.player.notify( 'Base drop effect' ); 
		},
		
		
		setup : function( type ){
					
			this.index = roll( 1, game.dropList.length );
			this.type = type || game.dropList[ this.index-1 ];
			
			var data = game.dropTable[ this.type ];
			for ( p in data ) {
				this[ p ] = data[ p ];
			}
			
			this.id = this.type+roll( 1, 999 );
			if( _DEBUG ) CAAT.log( "[Drop] setup with type: "+type+" -> "+this.type );
		},
		
		
		add : function( type, x, y, level ) {
			
			this.x = x || roll( 1, director.width );
			this.y = y || roll( 1, director.height );
			this.level = level || roll( ); 
			this.setup( type );
			
			var drop = this;
			var image = new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'items' ), 2, 3 );

			this.setLocation( this.x, this.y ).
				setBackgroundImage( image ).
				setScale( 0.5, 0.5 ).
				setPositionAnchor( 0.5, 0.5 ).
				setSpriteIndex( this.index );
			
			this.addBehavior( 
				new CAAT.Behavior.AlphaBehavior().
					setInterpolator( new CAAT.Behavior.Interpolator( ).createLinearInterpolator( 4, true ) ).
					setFrameTime( gameScene.time + ( game.options.drop.lifespan * game.options.tick_time ), game.options.drop.lifespan*game.options.tick_time ).
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