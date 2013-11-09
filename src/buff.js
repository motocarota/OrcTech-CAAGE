(function(){
	game.Buff = function ( duration, effect, harmful ) {
		
		this.target = null;
		this.lifetime = 0;
		this.duration = duration || 1;
		this.effect = effect || function(){ CAAT.log("[Buff] No effect defined") };
		this.harmful = harmful || false;
		
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
			},
			
			allowResist: function() {
			    return false;
			}
		}
	};
})();