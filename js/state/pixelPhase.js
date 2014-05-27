pixelPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.freeTiles = [];
}

//Extend the pixelPhase object to be a Phaser.State
pixelPhase.prototype = Object.create(Phaser.State.prototype);
pixelPhase.prototype.constructor = pixelPhase;


pixelPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_pixel', 16, this.generate, 'collectable_pixel', this.getItemPosition);
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

    //Instantiate new player object
	this._player = new Player(this._game, 1, 'player_pixel', this.getPlayerPosition);

	//postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {  
            self._game.add.existing(self._player);
        }})(this),200); 
}

pixelPhase.prototype.update = function(){
}


pixelPhase.prototype.getPlayerPosition = function(){
    return [Math.floor(pixelEvolution.width/32)*16, Math.floor(pixelEvolution.height/32)*16];
}

pixelPhase.prototype.getItemPosition = function(){
    var x = Math.floor(ROT.RNG.getUniform() * pixelEvolution.width/16);
    var y = Math.floor(ROT.RNG.getUniform() * pixelEvolution.height/16);

    return [x*16, y*16];
}

pixelPhase.prototype.generate = function(){
	return "0,";
}