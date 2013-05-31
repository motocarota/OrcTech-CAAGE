// componentSystem.js
/*
	This class implements the component system for game entities
	see: http://buildnewgames.com/js-game-code-org/
*/
(function() {

	game.component = {};
	game.createEntity = function( properties, components ) {

		var prop;
		var entity = {};

		for ( prop in properties ) {
			entity[ prop ] = properties[ prop ];
		}

		components.forEach( function( component ) {
			for ( prop in component ) {
				if ( entity.hasOwnProperty( prop ) ) {
					throw "Entity property conflict! " + prop;
				}
				entity[ prop ] = component[ prop ];
			}
		});
		return entity;
	}

}());