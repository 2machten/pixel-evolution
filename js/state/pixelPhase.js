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
    
    //Override the update function
    this._player.update = function(){
        if(!this._game._pause){

            this.ticks++;
            if (this.ticks > 4) {

            var spriteSize = 16;

            //during loading this is sometimes not working yet
            try{
                var items = this._game.state.getCurrentState()._map._items;
                //this._game.physics.arcade.collide(this, items, this.collisionHandler, null, this.update);
                this._game.physics.arcade.overlap(this, items, this.collisionHandler, null, this.update);
            }catch(e){}

            //Reset speed each update (else character keeps moving, velocity not position)
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;

            
                //walk up/down/left/right
                if (this.cursors.up.isDown)
                {
                    this.y = this.position.y-spriteSize;                   
                }
                else if (this.cursors.down.isDown)
                {             
                    this.y = this.position.y+spriteSize;              
                } else if (this.cursors.left.isDown)
                {                  
                    this.x = this.position.x-spriteSize;
                }
                else if (this.cursors.right.isDown)
                {
                    this.x = this.position.x+spriteSize;     
                } else {

                }
                this.ticks = 0;
            }
        } else {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;            
        }
    };

    //Override the collision detection.

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