(function() {
	
	var _DEBUG = false;
	
	CAAT.Player = function( ) {
		
		CAAT.Player.superclass.constructor.call( this );
		
		this.hp = 100;
		this.x = 0;
		this.y = 0;
		this.image = {
			name: 	'player',
			frameH: 1,
			frameW: 1
		},

		this.label = new CAAT.Foundation.UI.TextActor( );
		this.label.setFont( "26px "+game.options.font ).
			setLocation( this.x, this.y );
		
		return this;
	}
	
	CAAT.Player.prototype = {
		
		add : function () {

			if ( _DEBUG ) CAAT.log('[Player] add');
			this.sprite = new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( this.image.name ), this.image.frameH || 1, this.image.frameW || 1 );
			
			this.sprite.addAnimation( "stand", [0], 200 );
			for ( c in this.animations ) {
				if ( _DEBUG ) CAAT.log( "[Player] Add animation ",c );
				this.sprite.addAnimation( c, this.animations[c].frames, this.animations[c].duration, this.animations[c].reset );
			}
			this.setLocation( 
				game.options.player.startingX || director.width/2, 
				game.options.player.startingY || director.height/2 ).
				setPositionAnchor( 0.5, 0.5 ).
				enableEvents( false ).
				setBackgroundImage( this.sprite );
			game.bg.addChild( this );
		},
		
		heal : function ( amount ) {
			
			CAAT.log('[Player] heals for '+amount+' points of damage' );
			this.hp = this.hp+amount > 100 ? 100 : this.hp+amount;
			this.label.setText( "+"+amount ).
				setTextFillStyle( "#0f0" );
			
			this.label.addBehavior( 
				new CAAT.Behavior.AlphaBehavior().
					setFrameTime( gameScene.time, 900 ).
					setValues( 1, 0 ) 
			);
			
			this.label.addBehavior( 
				new CAAT.Behavior.PathBehavior( ).
					setPath( new CAAT.PathUtil.Path( ).setLinear( 50, 220, 50, 200 ) ).
					setFrameTime( gameScene.time, 900 )
			);
		},
		
		
		damage : function ( amount, element ) {

			if ( _DEBUG ) CAAT.log('[Player] receive '+amount+' points of '+element+" damage" );
			this.hp -= amount;
				
			this.label.setText( "-"+amount ).
				setTextFillStyle( "#f00" );
			
			this.label.addBehavior( 
				new CAAT.Behavior.AlphaBehavior().
					setFrameTime( gameScene.time, 900 ).
					setValues( 1, 0 ) 
			);
			
			this.label.addBehavior( 
				new CAAT.Behavior.PathBehavior( ).
					setPath( new CAAT.PathUtil.Path( ).setLinear( game.player.x, game.player.y, game.player.x, game.player.y-20 ) ).
					setFrameTime( gameScene.time, 900 )
			);
			
			if ( this.hp <= 0 ){
				this.hp = 0;
				this.die();
			}
		},
		
		
		notify : function ( text ) {

			if( _DEBUG ) CAAT.log('[Player] Notify this: "'+text+'"');
			game.UI.mainString.behaviorList = [];
			game.UI.mainString.
				setText( text ).
				setTextFillStyle( "yellow" ).
				addBehavior( 
					new CAAT.Behavior.AlphaBehavior().
						setFrameTime( gameScene.time, 100 ).
						setValues( 0, 1 ) 
				).
				addBehavior( 
					new CAAT.Behavior.AlphaBehavior().
						setFrameTime( gameScene.time+1000, 500 ).
						setValues( 1, 0 ) 
				);			
		},
		
		
		tick : function () {
			if ( _DEBUG ) CAAT.log( '[Player] Tick' );
			// Tick is a useful method to manage timed events and effect durations
			// this will be called every game.options.tick_time game.loop
		},
		
		
		die : function () {
			
			if ( _DEBUG ) CAAT.log( '[Player] Dies!' );
			game.UI.mainString.setText( 'Game Over' );
			CAAT.endLoop();
		},
		
		
		win : function () {
			
			if ( _DEBUG ) CAAT.log( '[Player] Wins!' );
			game.UI.mainString.setText( 'You Won!' );
			CAAT.endLoop();
		}
	};
	
	extend( CAAT.Player, CAAT.Actor );
})();