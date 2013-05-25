( function( ) {	
	
	CAAT.DEBUG = 0;
	window.game = {};
	window.spellIndex = 0;
	
	function startGame( images ) {
		
		window.director = new CAAT.Foundation.Director( ).initialize( 900, 500, 'experiment-canvas' );
		window.director.setImagesCache( images );
		window.scene = director.createScene( );
		window.player = new game.Player();
		
		scene.activated = function( ) {
			director.setClear( false );
		}
		
		// Spells
		game.spellBook = [
			new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'spell' ),  1, 3 ),
			new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'spell2' ), 1, 3 ),
			new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'spell3' ), 1, 3 ),
			new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'spell4' ), 1, 3 )
		];		
		
		// Background
		var bg = new CAAT.Foundation.ActorContainer( ).
			setBounds( 0, 0, director.width, director.height ).
			setBackgroundImage( new CAAT.Foundation.SpriteImage( ).initialize( director.getImage( 'bg' ), 1, 1 ) ).
			enableEvents( true ).
			cacheAsBitmap( );

		scene.addChild( bg );

		// Enemies
		game.enemies = [];
		var enemy = new CAAT.Enemy( );
		var index = Math.floor( Math.random()*game.enemiesList.length );
		enemy.add( game.enemiesList[ index ] );
		scene.addChild( enemy );

		CAAT.loop( 60 );
} )( );


module("Mage", {
    setup: function() {
		new CAAT.Module.Preloader.Preloader( ).
			//spells
			addElement( "spell",  "demo-resources/img/anim1.png" ).
			addElement( "spell2", "demo-resources/img/anim2.png" ).
			addElement( "spell3", "demo-resources/img/anim3.png" ).
			addElement( "spell4", "demo-resources/img/anim4.png" ).
			//monsters
			addElement( "bat", "img/sprites/bat.png" ).
			addElement( "wolf", "img/sprites/wolf.png" ).
			addElement( "dragon", "img/sprites/dragon.png" ).
			addElement( "kobold", "img/sprites/kobold.png" ).
			addElement( "zombie", "img/sprites/zombie.png" ).
			//other
			addElement( "splash", "img/splash/splash.jpg" ).
			addElement( "bg", "img/bg.jpg" ).
			addElement( "star", "img/favicon.png" ).
			load( function onAllAssetsLoaded( images ) {
				startGame( images );
			} 
		);
    },
    teardown: function() {
		
    }
});

test("init", function() {
	equal( player.name, 'PLAYER', "player.name" );
	equal( player.getId(), 1, "player.getId()" );
	equal( player.getCharId(), 0, "player.getCharId()" );
	
	equal( enemy.name, 'ENEMY', "enemy.name" );
	equal( enemy.getId(), 2, "enemy.getId()" );
	equal( enemy.getCharId(), 1, "enemy.getCharId()" );

	equal( player.getHp(), 5, "player.getHp() -> 5" );
	equal( enemy.getHp(), 6, "enemy.getHp() -> 6" );
	
	player.hp = 12; ok( 1, "player.setHp( 12 )");
	equal( player.getHp(), 12, "player.getHp() -> 12" );
	equal( enemy.getHp(), 6, "enemy.getHp() -> 6" );
	
	enemy.hp = 7; ok( 1, "enemy.setHp( 7 )");
	equal( player.getHp(), 12, "player.getHp() -> 12" );
	equal( enemy.getHp(), 7, "enemy.getHp() -> 7" );
	
	equal( player.getTarget(), enemy, "player.getTarget() -> enemy" );
	equal( enemy.getTarget(), player, "enemy.getTarget() -> player" );
});
	
	
test("spells 2", function() {	

	var enemy2 = new Status( {name:"ENEMY-TWO"} );
	var casters = [ player, enemy2, enemy ];
	var targets = [ enemy, player, enemy2 ];

	var c, t;
	var spell;
	for (var spellId=1; spellId < 4; spellId++) {
		for (var i=0; i < casters.length; i++) {
			c = casters[i];
			for (var j=0; j < targets.length; j++) {
				t = targets[j];
							
				spell = new Spell( { id:spellId, power:100 } );
				c.setTarget( t );
				c.cast( spell ); 
				ok( 1, "-------- ( "+c.name+" cast "+spell.name+" on "+t.name );
		
				ok( 1, player.name+" hp:"+player.getHp()+" fx:"+player.showEffects({duration:true}) );
				ok( 1, enemy.name+" hp:"+enemy.getHp()+" fx:"+enemy.showEffects({duration:true}) );
				ok( 1, enemy2.name+" hp:"+enemy2.getHp()+" fx:"+enemy2.showEffects({duration:true}) );
				
				player.tick(); 
				enemy.tick();
				enemy2.tick();
				ok( 1, "---- ( tick" );
		
				ok( 1, player.name+" hp:"+player.getHp()+" fx:"+player.showEffects({duration:true}) );
				ok( 1, enemy.name+" hp:"+enemy.getHp()+" fx:"+enemy.showEffects({duration:true}) );
				ok( 1, enemy2.name+" hp:"+enemy2.getHp()+" fx:"+enemy2.showEffects({duration:true}) );
			}
		}
	}
});