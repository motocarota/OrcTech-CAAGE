(function(){
	game.Buff = function ( duration, effect, harmful ) {
		
		this.target = null;
		this.lifetime = 0;
		this.duration = duration || 1;
		this.effect = effect || function(){ CAAT.log("[Buff] No effect defined") };
		this.harmful = harmful || false;
		
		//nota: pare non riesca ad assegnarmi la durata
		// provare con un metodo tipo init
		return {
			
			duration : 1,
			effect : function(){ CAAT.log("[Buff] No effect defined") },
			harmful : false,
			
			init: function( duration, effect, harmful ){
				this.lifetime = 0;
				this.duration = duration || 1;
				this.effect = effect || function(){ CAAT.log("[Buff] No effect defined") };
				this.harmful = harmful || false;
			},
			
			setTarget: function( target ) {
				this.target = target;
			},
			
			tick: function( ) {
				if ( this.isActive() ){
					this.effect( this.target );
					this.lifetime++;
				}
			},
			
			isActive: function() {
				return ( this.getDurationLeft() > 0 );
			},
			
			isHarmful: function() {
				return ( this.harmful );
			},
			
			getTarget: function() {
				return this.target;
			},
			
			getDuration: function() {
				return this.duration;
			},
			
			getDurationLeft: function() {
				return this.duration - this.lifetime;
			},
			
			firstTick: function() {
				return ( this.getDurationLeft() === this.getDuration() );
			},
			
			lastTick: function() {
				return ( this.getDurationLeft() === 0 );
			}
		}
	};
})();

/* 
TODO:

Note: these two methods are required to create buffs like +10stamina for 30 seconds 
 var potion = new Buff(
	30,
	function effect( t ) {
		if ( this.firstTick() ) t.stamina+=10;
		if ( this.lastTick() ) t.stamina-=10;
	},
	false
);
var piero = new Player();
piero.addBuff( potion );


applyBuff( b ){
	b.setTarget( this )
	this.buffs.push( b )
}
..

tick(){
...
	for (var i=0; i < this.buffs.length; i++) {
		
		if( this.buffs[i].isActive() )
			this.buffs[i].tick()
		else
			this.buffs.splice( i, 1 );
	}
}
*/
// var c = new game.Buff();
// c.init( 30, function(t){ console.log("buff"); t.damage(2) } );
// game.enemies[0].addBuff( c )