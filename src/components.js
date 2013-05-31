(function() {

    game.component.entity = {
        distanceTo: function( x, y ) {
            return Math.sqrt( Math.pow( x - this.x, 2 ) + Math.pow( y - this.y, 2 ) );
        }
    }

    game.component.moveable = {
        move: function( x, y ) {
            this.x = x;
            this.y = y;
        }
    }
}());