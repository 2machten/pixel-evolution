pacmanPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this._freeTiles = [];
}

//Extend the pacmanPhase object to be a Phaser.State
pacmanPhase.prototype = Object.create(Phaser.State.prototype);
pacmanPhase.prototype.constructor = pacmanPhase;


pacmanPhase.prototype.create = function(){
	//instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_pacman', 32, this.generate, 'collectable_pacman', this.getItemPosition);
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

	//create player
    this._player = new Player(this._game, 0.9, 'player_pacman', this.getPlayerPosition);

    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {  
            self._game.add.existing(self._player);
        }})(this),200); 

}

pacmanPhase.prototype.update = function(){

}

pacmanPhase.prototype.getItemPosition =
pacmanPhase.prototype.getPlayerPosition = function(){
    //shuffle the array of free tiles
    shuffle(this._freeTiles);
    
    //returns an array of x and y position (nth tile) that is free, 
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._freeTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}


//Create a black background to make transitions between phases smoother.
pacmanPhase.prototype.generate = function(){
	this._freeTiles = [];

	var map =   "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n"+
				"0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0\n"+
				"0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0\n"+
				"0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0\n"+
				"0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0\n"+
				"0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0\n"+
				"0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0\n"+
				"0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0\n"+
				"0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0\n"+
				"0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0\n"+
				"0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0\n"+
				"0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0\n"+
				"0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0\n"+
				"0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0\n"+
				"0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0\n"+
				"0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0\n"+
				"0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0\n"+
				"0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0\n"+
				"0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0\n"+
				"0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0\n"+
				"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0";

	var rows = map.split("\n");
	for (var y = 0; y < rows.length; y++) {
		var tiles = rows[y].split(",");
		for (var x = 0; x < tiles.length; x++) {
			if (tiles[x] == 0) {
				var tile = [x, y];
				this._freeTiles.push(tile);
			}
		}
	}
	return map;
}

//helper method: shuffles arrays
function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
