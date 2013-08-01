module( "Base", {
	setup: function(){
		game.player = new CAAT.Player();
		setupOptions();
	},
	tearDown: function() {

	}
} );

	test( "Game init", 7, function() { 
		ok( game, "Game Object ready" );
		ok( game.player, "Player Object ready" );
		ok( game.enemies, "Enemies Array ready" );
		ok( game.spellBook, "Spellbook Object ready" );
		ok( game.spellList, "SpellList Object ready" );
		ok( game.options, "Game Options ready" );
		ok( game.Buff, "Buff Class ready" );
	} );

	test( "Roll method - no args", 100, function(){
		var res, i=0;
		while ( i++ < 100 ){
			res = roll();
			ok( res<7 && res>0, "roll(): "+res );
		}
	} );

	test( "Roll method - one arg", 100, function(){
		var res, i=0, a;
		while ( i++ < 100 ){
			a = roll(1, 200);

			res = roll( a );
			ok( is("Number", res) && res<1+6*a && res>1-a, "roll("+a+"): "+res );
		}
	} );

	test( "Roll method - two args", 100, function(){
		var res, i=0, a, b;
		while ( i++ < 50 ){
			a = roll(1, 200);
			b = roll(1, 200);
			
			res = roll( a, b );
			ok( is("Number", res) && res<1+(a*b) && res>a-1, "roll("+a+", "+b+"): "+res );
			
			res = roll( b, a );
			ok( is("Number", res) && res<1+(a*b) && res>b-1, "roll("+b+", "+a+"): "+res );
		}
	} );
	
	test( "Roll method - three args", 100, function(){
		var res, i=0, a, b, c;
		while ( i++ < 50 ){
			a = roll(1, 200);
			b = roll(1, 200);
			c = roll(1, 200);
			
			res = roll( a, b, c );
			ok( is("Number", res) && res<c+1+(a*b) && res>c+a-1, "roll("+a+", "+b+", "+c+"): "+res );
			
			res = roll( b, a, c );
			ok( is("Number", res) && res<c+1+(a*b) && res>c+b-1, "roll("+b+", "+a+", "+c+"): "+res );
		}
	} );
	
	test( "Roll method - bad args", 1, function(){
		ok(1, "TODO");
	} );
	
module( "Buff Class", {
	
	setup: function(){
		
		window.director = {};
		game.buffList = {
			slow: [ 10, function(t){ if( this.firstTick() ) t.speed--; if( this.lastTick() ) t.speed++; }, true ],
			dot: [ 10, function(t){ t.damage(2) }, true ]
		};
		setupOptions();
		game.player = new CAAT.Player();
		game.player.notify = function(msg){ console.log(msg) };
		game.player.notifyAt = function(msg){ console.log(msg) };
		
		var i=0;
		while ( i++ < 10 ){
			var en = new CAAT.Enemy( );
			en.type = game.enemiesList[ roll( 0, game.enemiesList.length ) ];
			en.setup();
			game.enemies.push( en );
		}
		window.tick = function() {
			game.player.tick();
			for ( e in game.enemies ) {
				game.enemies[ e ].tick();
			}
		}
		
	},
	tearDown: function() {

	}
} );

	test( "Initialization", 7, function() { 
		
		var c = new game.Buff();
		ok( c, "Buff ready" );
		c.init( 10, function(t){ if( this.firstTick() ) t.speed--; if( this.lastTick() ) t.speed++; }, true );
		equal( c.getDuration(), 10, "Buff duration: "+c.getDuration() );
		equal( c.getDurationLeft(), c.getDuration(), "Buff duration left :"+c.getDurationLeft() );
		ok( c.isHarmful(), "Buff is harmful" );
		ok( c.isActive(),  "Buff is active" );
		ok( c.firstTick(), "Buff is at first tick" );
		ok( !c.lastTick(), "Buff is not at last tick" );
	} );
	
	test( "targetting", 4, function() { 
		
		var c = new game.Buff();
		equal( c.getTarget(), undefined, "Buff without a target" );
		c.setTarget( game.player );
		equal( c.getTarget(), game.player, "Buff with target -> player" );
		c.setTarget( game.enemies[0] );
		equal( c.getTarget(), game.enemies[0], "Buff with target -> enemy" );
		
		var z = new game.Buff();
		game.enemies[1].addBuff( z );
		equal( z.getTarget(), game.enemies[1], "addBuff method" );
	} );
	
	test( "ticking", 23, function() { 
		
		var c = new game.Buff();
		var dur = 5
		c.init( dur, function(t){ if( this.firstTick() ) t.speed--; if( this.lastTick() ) t.speed++; }, true );
		game.enemies[2].addBuff( c );
		
		equal( c.getDuration(), dur, "duration: "+c.getDuration() );
		equal( c.getDurationLeft(), dur, "duration left :"+c.getDurationLeft() );
		ok( c.isActive(), "active" );
		ok( c.firstTick(), "first tick" );
		ok( !c.lastTick(), "NOT last tick" );
		
		c.tick();
		ok(1, "---< One tick >---");
		
		equal( c.getDuration(), dur, "duration: "+c.getDuration() );
		equal( c.getDurationLeft(), dur-1, "duration left :"+c.getDurationLeft() );
		ok( c.isActive(), "active" );
		ok( !c.firstTick(), "NOT first tick" );
		ok( !c.lastTick(), "NOT last tick" );
		
		c.tick();
		c.tick();
		c.tick();
		ok(1, "---< Three ticks >---");
		
		equal( c.getDuration(), dur, "duration: "+c.getDuration() );
		equal( c.getDurationLeft(), dur-4, "duration left :"+c.getDurationLeft() );
		ok( c.isActive(), "active" );
		ok( !c.firstTick(), "NOT first tick" );
		ok( !c.lastTick(), "NOT last tick" );
		
		c.tick();
		ok(1, "---< One tick >---");
		
		equal( c.getDuration(), dur, "duration: "+c.getDuration() );
		equal( c.getDurationLeft(), dur-5, "duration left :"+c.getDurationLeft() );
		ok( !c.isActive(), "NOT active" );
		ok( !c.firstTick(), "NOT first tick" );
		ok( c.lastTick(), "last tick" );
	} );
	
	test( "enemy ticking (dot)", 27, function() { 
		
		var buff = new game.Buff();
		var dur = 5
		buff.init( dur, function(t){ t.damage(1); }, true );
		var en = game.enemies[roll()];
		en.buffs = [];
		en.addBuff( buff );
		var c = en.buffs[0];
		var hp = en.getHp();
		
		equal( en.buffs[0].getDuration(), dur, "duration: "+en.buffs[0].getDuration() );
		equal( en.buffs[0].getDurationLeft(), dur, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( en.buffs[0].firstTick(), "first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		ok( 1, "starting HP: "+hp );
		ok( 1, "---< One tick >---");
		
		equal( en.getHp(), hp-1, "Effect : -1hp" );
		equal( en.buffs[0].getDurationLeft(), dur-1, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		window.tick();
		window.tick();
		ok( 1, "---< Three ticks >---");
		
		equal( en.getHp(), hp-4, "Effect : -3hp" );
		equal( en.buffs[0].getDurationLeft(), dur-4, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		ok(1, "---< One tick >---");
		
		equal( en.getHp(), hp-5, "Effect : -5hp" );
		equal( en.buffs[0].getDurationLeft(), 0, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( !en.buffs[0].isActive(), "NOT active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( en.buffs[0].lastTick(), "last tick" );
		
		window.tick();
		ok(1, "---< One tick >---");
		
		equal( en.getHp(), hp-5, "Effect : -5hp" );
		equal( en.buffs[0], undefined, "Buff removed" );
	} );
	
	test( "enemy ticking (slow)", 24, function() { 
		
		var dur = 5;
		var en = game.enemies[2];
		var startingSpd = en.speed;
		var buff = new game.Buff();
		buff.init( 
		//speed potion
			dur, 
			function(t){ 
				if( this.firstTick() ) t.modifiers.speed = 20; 
				if( this.lastTick() ) t.modifiers.speed = -20; 
			}, 
			false 
		);
		en.buffs = [];
		en.addBuff( buff );
		var c = en.buffs[0];
		
		equal( en.buffs[0].getDuration(), dur, "duration: "+en.buffs[0].getDuration() );
		equal( en.buffs[0].getDurationLeft(), dur, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( en.buffs[0].firstTick(), "first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		ok(1, "---< One tick >---");
		
		equal( game.enemies[2].getSpeed(), startingSpd+20, "Buff effect" );
		equal( en.buffs[0].getDurationLeft(), dur-1, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		window.tick();
		window.tick();
		ok(1, "---< Three ticks >---");
		
		equal( en.buffs[0].getDurationLeft(), dur-4, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( en.buffs[0].isActive(), "active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( !en.buffs[0].lastTick(), "NOT last tick" );
		
		window.tick();
		ok(1, "---< One tick >---");
		
		equal( en.buffs[0].getDurationLeft(), 0, "duration left :"+en.buffs[0].getDurationLeft() );
		ok( !en.buffs[0].isActive(), "NOT active" );
		ok( !en.buffs[0].firstTick(), "NOT first tick" );
		ok( en.buffs[0].lastTick(), "last tick" );
		
		window.tick();
		ok(1, "---< One tick >---");
		
		equal( game.enemies[2].speed, startingSpd, "Buff effect" );
		equal( en.buffs[0], undefined, "Buff removed" );
	} );
	
	
//TODO test this ingame	
// var c = new game.Buff();
// c.init( 5, function(t){ if( this.firstTick() ) { t.halt(); } if( this.lastTick() ) { t.ai() }; } ) 
// game.enemies[0].addBuff( c )