
/*
 *
 * 		Graveyard demo - OrcTech CAAGE - Simone Poggi 2013
 * 	
 * 	This is a simple demo to show how to do nice stuff with this game engine
 * 	A serious documentation about this is coming out soon(tm)
 *
 */

(function() {	
	CAAT.DEBUG = 1;
	var _DEBUG = 0,
		_FILE_VERSION = 0000,
		_CELL_SIZE = 5,
		_MAX_BAR_HEIGHT = 15,
		_MAX_BAR_WIDTH = 360;

	window.addEventListener( 'load', load, false );
	window.testLoad = load;
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
			addElement( "shield",	"img/shield.png" ).
			//monsters
			addElement( "zombie",	"img/zombie.png" ).
			addElement( "skeleton",	"img/skeleton.png" ).
			addElement( "wraith",	"img/wraith.png" ).
			//projectiles
			addElement( "arrow",	"img/rock.png" ).
			addElement( "rock",		"img/arrow.png" ).
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
			game.player.castSpell( game.player.spellIndex, ev.point.x, ev.point.y );
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

		game.UI.magicMissileBtn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'mmissile' ), 1, 4 ),
				0, 0, 0, 0,
				function( button ) {
					game.player.spellIndex = 0;
					game.player.notify( game.spellList[0] );
				} ).
			setPositionAnchor( 0, 0 ).
			setLocation( 250, 500 );
			
		game.UI.fireballBtn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'fb-travel' ), 2, 2 ),
				0, 0, 0, 0,
				function( button ) {
					game.player.spellIndex = 1;
					game.player.notify( game.spellList[1] );
				} ).
			setPositionAnchor( 0, 0 ).
			setLocation( 380, 520 );
		
		game.UI.shieldBtn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'shield' ), 1, 1 ),
				0, 0, 0, 0,
				function( button ) {
					game.player.shieldActivated();
				} ).
			setScale( 0.5, 0.5 ).
			setPositionAnchor( 0, 0.5 ).
			setLocation( 70, 535 );
				
		game.UI.pauseBtn = new CAAT.Foundation.Actor( ).
			setAsButton( 
				new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'base' ),  2, 10 ),
				0, 0, 0, 0,
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
				
		gameScene.addChild( game.UI.mainString );
		gameScene.addChild( game.UI.pauseBtn );
		gameScene.addChild( game.UI.healthBar );
		gameScene.addChild( game.UI.manaBar );
		gameScene.addChild( game.UI.magicMissileBtn );
		gameScene.addChild( game.UI.fireballBtn );
		gameScene.addChild( game.UI.shieldBtn );
		
		game.player.notify( 'Game start!' );
	}
	
	
	function tick() {
		
		//UPDATE PLAYER
		game.player.tick();
		
		//UPDATE ENEMIES
		game.enemies = _.sortBy( game.enemies, 'y' );
		for (var i=0; i < game.enemies.length; i++) {
            game.enemies[i].tick();
            game.bg.setZOrder( game.enemies[i], i );
		};
		// Enemies generation
		if ( game.enemies.length < game.options.enemies.maxNumber && Math.random() < (game.options.enemies.spawnRate || 0.2) ) {
			enemy = new CAAT.Enemy( );
			enemy.add( game.enemiesList[ roll( game.enemiesList ) ] );
            enemy.ai( );
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