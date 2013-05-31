
/*
 *
 * 		Graveyard demo - OrcTech CAAGE - Simone Poggi 2013
 * 	
 * 	This is a simple demo to show how to do nice stuff with this game engine
 * 	A serious documentation about this is coming out soon(tm)
 *
 */

(function() {	
	CAAT.DEBUG = 0;
	var _DEBUG = 0,
		_FILE_VERSION = 0000,
		_CELL_SIZE = 5,
		_MAX_BAR_HEIGHT = 15,
		_MAX_BAR_WIDTH = 360;

	window.addEventListener( 'load', load, false );
		
    function load( ) {

		new CAAT.Module.Preloader.Preloader( ).
			//debug sprite
			addElement( "base",		"img/base.png" ).
			//player
			addElement( "player",	"img/mage.png" ).
			//spells
			addElement( "mmissile",	"img/missile.png" ).
			addElement( "fb-travel","img/fb-travel.png" ).
			addElement( "fb-splash","img/fb-splash.png" ).
			//monsters
			addElement( "zombie",	"img/zombie.png" ).
			addElement( "skeleton",	"img/skeleton.png" ).
			addElement( "wraith",	"img/wraith.png" ).
			//other
			addElement( "bg",		"img/gy-back.png" ).
			addElement( "fg",		"img/gy-fore.png" ).
			
			load( function onAllAssetsLoaded( images ) {
				startGame( images );
			} 
		);
    }


	function startGame( images ) {

		setupOptions( );
		setupScene( images );
		setupBackground( );
		setupPlayer( );
		setupTimers( );
		setupUI( );

		CAAT.loop( 30 );
	}
	

	function setupScene( images ) {
		
		window.director = new CAAT.Foundation.Director( ).initialize( 900, 600, 'experiment-canvas' );
		window.director.setImagesCache( images );
		window.gameScene = director.createScene( );
		window.menuScene = director.createScene( );
		menuScene.activated = function() {
			director.setClear( CAAT.Foundation.Director.CLEAR_ALL );
		};
		var btn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'base' ), 1, 3 ),
				0, 0, 0, 0,
				function( button ){
					director.switchToPrevScene( 2000, false	, true );
				} ).
			setLocation( 300, 300 );
		menuScene.addChild( btn );

		gameScene.checkCollisions = function( entity ) {
			
			if ( _DEBUG ) CAAT.log("[Main] CheckCollision ");
			var max = Math.max( director.width, director.height );
			var entitiesCollision = new CAAT.Module.Collision.QuadTree().create( 
				0, 0, max*_CELL_SIZE, max*_CELL_SIZE, game.enemies );

			var collide = entitiesCollision.getOverlappingActors( 
				new CAAT.Rectangle().setBounds( 
					entity.x - ( entity.width / 2 ), 
					entity.y - ( entity.height / 2 ), 
					entity.width, 
					entity.height )
			);
			if ( collide.length ) {
				for ( var i = collide.length - 1; i >= 0; i-- ) {
					if ( entity.targets[ collide[i].id ] !== true ) {
						entity.targets[ collide[i].id ] = true;
						entity.splash.effect( collide[i] );
						if ( _DEBUG ) CAAT.log("[Main] Collision Found: "+spell.id+" hits "+collide[i].id );
					}
				};
			}
		};
	}
	
	
	function setupBackground( ) {
		
		// Background
		game.bg = new CAAT.Foundation.ActorContainer( ).
			setBounds( 0, 0, director.width, director.height ).
			setBackgroundImage( new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'bg' ), 1, 1 ) ).
			enableEvents( true ).
			cacheAsBitmap( );
		// Foreground
		game.fg = new CAAT.Foundation.Actor( ).
			setBounds( 0, 0, director.width, director.height ).
			setBackgroundImage( new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'fg' ), 1, 1 ) ).
			enableEvents( false ).
			cacheAsBitmap( );
			
		gameScene.addChild( game.bg );
		gameScene.addChild( game.fg );
		
		game.bg.mouseDown = function( ev ) {
			game.player.castSpell( game.spellIndex, ev.point.x, ev.point.y );
		};
	}	
	
	function setupPlayer() {
		
		game.player = new CAAT.Mage( );
		game.player.add();
		game.killCount = 0;
	}
	
	
	function setupTimers () { 
		
		game.time = game.options.global_cooldown;
		game.mainTimer = gameScene.createTimer(
			0,
			Number.MAX_VALUE, 
			null,
			function(){ 
				if( game.time-- < 0 ) {
					tick();
					game.time = game.options.global_cooldown;
				} 
			},
			null 
		);
	}
	
	
	function setupUI () {
		
		game.UI = {};
		
		game.UI.spellBtns = [];
		for ( i in game.spellList ) {
			var img = game.spellBook[ game.spellList[i] ].icon;
			game.UI.spellBtns[i] = new CAAT.Foundation.Actor( ).
				setAsButton( 
					new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'base' ), 2, 10 ),
					i, 0, 0, 0,
					function( button ) {
						game.spellIndex = button.spellId;
						game.player.notify( game.spellList[button.spellId] );
					} ).
				setPositionAnchor( 0, 0 ).
				setLocation( 100+(100*i), 500 );
			game.UI.spellBtns[i].spellId = i;
		};
		
			
		game.UI.pauseBtn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'base'  ),  2, 10 ),
				1, 2, 3, 4, 
				function( button ){ 
					CAAT.log('[Main] Game Paused = '+!gameScene.paused )
					gameScene.setPaused( !gameScene.paused );
				} ).
			setPositionAnchor( 0.5, 0 ).
			setLocation( director.width/2, 5 );
		
		game.UI.mainString = new CAAT.Foundation.UI.TextActor( ).
			setText( "hello" ).
			setFont( "30px "+game.options.font ).
			setTextFillStyle( "red" ).
			setTextAlign('center').
			setLocation( director.width/2, 50 );
		
		gameScene.addChild( game.UI.mainString );
		
		game.UI.healthBar = new CAAT.Foundation.UI.ShapeActor().
			setLocation( 50, 10 ).
			setSize( _MAX_BAR_WIDTH, _MAX_BAR_HEIGHT ).
			setFillStyle( '#f55' ).
			setShape( CAAT.Foundation.UI.ShapeActor.SHAPE_RECTANGLE ).
			enableEvents( false ).
			setStrokeStyle( '#fff' );

		game.UI.manaBar = new CAAT.Foundation.UI.ShapeActor().
			setLocation( 50, 30 ).
			setSize( _MAX_BAR_WIDTH, _MAX_BAR_HEIGHT ).
			setFillStyle( '#55f' ).
			setShape( CAAT.Foundation.UI.ShapeActor.SHAPE_RECTANGLE ).
			enableEvents( false ).
			setStrokeStyle( '#fff' );
			
		if ( _DEBUG ) {
			game.UI.debugString = new CAAT.Foundation.UI.TextActor( ).
				setText( "file version: "+_FILE_VERSION ).
				setFont( "20px arial" ).
				setTextAlign('right').
				setLocation( director.width-5, director.height-25 );

			gameScene.addChild( game.UI.debugString );
		}
		for( btn in game.UI.spellBtns )
			gameScene.addChild( game.UI.spellBtns[ btn ] );
		gameScene.addChild( game.UI.pauseBtn );
		gameScene.addChild( game.UI.healthBar );
		gameScene.addChild( game.UI.manaBar );
		game.player.notify( 'Game start!' );
	}
	
	
	function tick() {
		
		//UPDATE PLAYER
		game.player.tick();
		
		//UPDATE ENEMIES
		for ( e in game.enemies ) {
			game.enemies[ e ].tick();
		}
				
		// Enemies generation
		if ( game.enemies.length < game.options.enemies.maxNumber && Math.random() < (game.options.enemies.spawnRate || 0.2) ) {
			var enemy = new CAAT.Enemy( );
			enemy.add( game.enemiesList[ roll( 1, game.enemiesList.length )-1 ] );
			enemy.move( );
		}
		
		//UPDATE UI
		game.UI.healthBar.
			setSize( game.player.hp / 100 * _MAX_BAR_WIDTH, _MAX_BAR_HEIGHT ).
			setLocation( 50, 10 );
			
		game.UI.manaBar.
			setSize( game.player.mana / 100 * _MAX_BAR_WIDTH, _MAX_BAR_HEIGHT ).
			setLocation( 50, 30 );
			
		if ( game.killCount > game.options.enemies.wave )
			game.player.win();
	}
} )( );