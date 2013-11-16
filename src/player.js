(function() {
	
	var _DEBUG = false;
	
	CAAT.Player = function( ) {
		
		CAAT.Player.superclass.constructor.call( this );
		
		this.hp = 100;
		this.x = 0;
		this.y = 0;
		this.buffs = [];
		this.image = {
			name: 	'player',
			frameH: 1, 
			frameW: 1
		};
		
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
				enableEvents( false ).
				setPositionAnchor( 0.5, 0.5 ).
				setBackgroundImage( this.sprite );
							
			game.bg.addChildAt( this, this.y );
		},
		
		heal : function ( amount ) {
			
			if ( _DEBUG ) CAAT.log('[Player] heals for '+amount+' points of damage' );
			this.hp = _.min( [ this.hp + amount, game.options.player.max_hp ] );
			this.notifyAt( "+"+amount, { x: game.player.x, y: game.player.y }, 'green' );
		},
		
		
		damage : function ( amount, element ) {

			if ( _DEBUG ) CAAT.log('[Player] receive '+amount+' points of '+element+" damage" );
			this.hp -= amount;
		},
		
		
		notify : function ( text, color ) {

			if( _DEBUG ) CAAT.log('[Player] Notify this: "'+text+'"');
			
			if ( !text ) 
				return;
			
			if ( !color )
				color = "yellow";
			
			game.UI.mainString.behaviorList = [];
			game.UI.mainString.
				setFrameTime( gameScene.time, 900 ).
				setText( text ).
				setTextFillStyle( color ).
				setFont( game.options.font ).
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
		
		
		notifyAt : function ( text, pos, color ) {
			
			if ( !text )
				return;
						
			if ( !color )
				color = "yellow";
			
			if ( !pos || !pos.x || !pos.y )
				pos = { x: this.x ,y: this.y };
			
			
			if( _DEBUG ) CAAT.log('[Player] Notify this: "'+text+'" at '+pos.x+","+pos.y);
			var x = pos.x - 20 + roll( 1, 40 ); //randomize a little text position

			game.bg.addChild(
				new CAAT.Foundation.UI.TextActor( ).
					setFrameTime( gameScene.time, 900 ).
					setFont( game.options.font ).
					setLocation( x, pos.y ).
					setText( text ).
					setTextFillStyle( color ).
					addBehavior( 
						new CAAT.Behavior.AlphaBehavior().
							setFrameTime( gameScene.time, 900 ).
							setValues( 1, 0 )
					).
					addBehavior( 
						new CAAT.Behavior.PathBehavior( ).
							setPath( new CAAT.PathUtil.Path( ).
							setLinear( x, pos.y-20, x, pos.y-40 ) ).
							setFrameTime( gameScene.time, 900 )
					)
			);
		},
		
		
		addBuff: function( b ) {
			//if( b.isHarmful() ) try to resist to it
			if( _DEBUG ) CAAT.log( "[Player] added a buff: ", b );
			b.setTarget( this );
			this.buffs.push( b );
		},
		
		
		tick : function () {
			
			if ( _DEBUG ) CAAT.log( '[Player] Tick' );
			// Tick is called periodically to manage timed events and effect durations; 
			// Nothing to do right now
		},
		
		
		die : function () {
			
			if ( _DEBUG ) {
				CAAT.log( '[Player] Dies!' );
				return;
			}
			game.UI.mainString.setText( 'Game Over' );
			CAAT.endLoop();
		},
		
		
		win : function () {
			
			if ( _DEBUG ) {
				CAAT.log( '[Player] Wins!' );
				return;
			}
			game.UI.mainString.setText( 'You Won!' );
			CAAT.endLoop();
		}
	};
	
	extend( CAAT.Player, CAAT.Actor );
})();