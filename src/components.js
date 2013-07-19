(function() {
// TODO capire come mai non riesco a far avere i metodi agli oggetti
// es. un nemico con la componente moveable non riceveva il metodo move

	game.component.entity = {

	}

	game.component.moveable = {
		x: 0,
		y: 0,
		move: function( x, y ) {
			this.x = x;
			this.y = y;
		},
		distanceTo: function( x, y ) {
			return Math.sqrt( Math.pow( x - this.x, 2 ) + Math.pow( y - this.y, 2 ) );
		}
	}
	
	game.component.damageable = {

		hp: 100,
		damage: function( amount, element ){
			amount = this.damageFilter( amount, element );
			this.hp -= amount;
		},
		damageFilter: function( amount, element ){
			var total = amount;
			if ( this.resistance[element] )
				total -= this.resistance[element];
			return total < 0 ? 0 : total;
		}
	};
}());