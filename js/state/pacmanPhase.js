pacmanPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this._freeTiles = [];

    this._game.stage.smoothed = false;
    this._lastMove = null;
}

//Extend the pacmanPhase object to be a Phaser.State
pacmanPhase.prototype = Object.create(Phaser.State.prototype);
pacmanPhase.prototype.constructor = pacmanPhase;

pacmanPhase.prototype.create = function(){
	this._enemies = [];
	//instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_pacman', 32, 'collectable_pacman');
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.sound.stopAll();
    this._game.add.existing(this._map._items);

    //start music
    this._game._music.play('bg1');

	//create player
	switch (this._game._level) {
		default:
        case 3: 
            this._player = new Player(this._game, 1, 'player_pacman1', 100);
            break;
        case 4:
            this._player = new Player(this._game, 0.9, 'player_pacman2', 120);
            break;
        case 5:
            this._player = new Player(this._game, 0.9, 'player_pacman3', 150);
            break;
    }

    for(var i = 0; i < 4; i++) {
    	this._enemy = new Enemy(this._game, 1, 'enemy_pacman'+(i+1));

    	this._enemy.update = function(){
    		try {
		        var player = this._state._player;
		        this._game.physics.arcade.overlap(this, player, player.enemyCollisionHandler, null, this.update);
		    } catch (e) {
		    }

		    ticks++;
		    this.spriteSize = 32;
		    var tiles = this._game.state.getCurrentState()._layer;
		    this._game.physics.arcade.overlap(this, tiles, this.collisionHandler, null, this.update);

		    if(ticks > 40) {
                ticks = 0;

                var diffx = (this._state._player.position.x - this.position.x);
		        var diffy = (this._state._player.position.y - this.position.y);
		        
		        if((diffx > 16 && diffx < 144) || (diffy > 16 && diffy < 144)){
		            this.pacmanPlayer(diffx, diffy);
		        } else {
		        	this.pacmanNormal();
		        }
            }
    	}
    	this._enemies.push(this._enemy);
    }	
    

    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {  
            self._game.add.existing(self._player);
            for(var i = 0; i < 4; i++) {
            	self._game.add.existing(self._enemies[i]);
            }
        }})(this),200); 


	this._score = new Phaser.Group(this._game, null, "score", false);

	var collectable = this._game.add.sprite(this._game.camera.width - 25, this._game.camera.height - 25, 'collectable_pacman');
	collectable.anchor.setTo(0.5, 0.5);
	this._collectableText = this._game.add.text(this._game.camera.width - 60, this._game.camera.height - 25, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
	this._collectableText.anchor.setTo(0.5, 0.5);

	this._score.fixedToCamera = true;
	this._score.add(collectable);
	this._score.add(this._collectableText);
	this._game.add.existing(this._score);
	
 	if(this._game._level == 3){
		this._game.showMessage("Darn, enemies!\n I should be quick this time.");
	}
}

pacmanPhase.prototype.update = function(){
	var map = this._game.state.getCurrentState()._map;
    var items = map._items;

	//Check whether the collectables are collected, and whether we are not yet in the last level of the phase.
        if(items.children.length == 0 && !ran && this._game._level != 6){
            console.log("Next level");
            ran = true;
            run = true;
            this._game._level++;
            console.log(this._game._level);
        } 
}

pacmanPhase.prototype.getEnemyPosition = function() {
	if(this._game._level == 3 || this._game._level == 5) {
		switch(this._enemies.length) {
			case 0: return [10*32, 8*32];
			case 1: return [14*32, 8*32];
			case 2: return [10*32, 10*32];
			case 3: return [14*32, 10*32];
		}
	} else if(this._game._level == 4) {
		switch(this._enemies.length) {
			case 0: return [11*32, 5*32];
			case 1: return [13*32, 5*32];
			case 2: return [11*32, 13*32];
			case 3: return [13*32, 13*32];
		}
	} 
}

pacmanPhase.prototype.getPlayerPosition = function(){
	return [0, 0];
}


pacmanPhase.prototype.getItemPosition = function(){
    //shuffle the array of free tiles
    shuffle(this._freeTiles);
    
    //returns an array of x and y position (nth tile) that is free, 
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._freeTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}


//Load the hardcoded map
pacmanPhase.prototype.generate = function(){
	this._freeTiles = [];

	switch (this._game._level) {
		case 3: var map =   
				"0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0\n"+
				"0, 8, 5, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 7, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 6, 0\n"+
				"0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0\n"+
				"0, 0, 0, 6, 0, 3, 5, 5, 5, 5, 5,14, 5,14, 5, 5, 5, 5, 5, 4, 0, 6, 0, 0, 0\n"+
				"0, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 0, 0, 6, 0, 1, 0\n"+
				"0, 6, 0, 6, 0, 1, 0, 1, 0, 8, 5, 9, 0, 10,5, 7, 0, 1, 0, 1, 0, 6, 0, 6, 0\n"+
				"0, 6, 0, 2, 0, 6, 0, 6, 0, 2, 0, 0, 0, 0, 0, 2, 0, 6, 0, 6, 0, 2, 0, 6, 0\n"+
				"0, 6, 0, 0, 0, 6, 0, 6, 0, 0, 0, 1, 0, 1, 0, 0, 0, 6, 0, 6, 0, 0, 0, 6, 0\n"+
				"0,12, 5, 5, 5,11, 0, 6, 0, 3, 5,15, 5,15, 5, 4, 0, 6, 0,12, 5, 5, 5,11, 0\n"+
				"0, 6, 0, 0, 0, 6, 0, 6, 0, 0, 0, 2, 0, 2, 0, 0, 0, 6, 0, 6, 0, 0, 0, 6, 0\n"+
				"0, 6, 0, 1, 0, 6, 0, 6, 0, 1, 0, 0, 0, 0, 0, 1, 0, 6, 0, 6, 0, 1, 0, 6, 0\n"+
				"0, 6, 0, 6, 0, 2, 0, 2, 0,10, 5, 7, 0, 8, 5, 9, 0, 2, 0, 2, 0, 6, 0, 6, 0\n"+
				"0, 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 0, 0, 6, 0, 2, 0\n"+
				"0, 0, 0, 6, 0, 3, 5, 5, 5, 5, 5,13, 5,13, 5, 5, 5, 5, 5, 4, 0, 6, 0, 0, 0\n"+
				"0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 6, 0\n"+
				"0, 10,5, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 9, 0\n"+
				"0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0\n"
				break;
			case 4: 
				var map = 	
				"0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0\n"+
				"0, 1, 0, 2, 0, 8, 5, 5, 5, 5, 4, 0, 6, 0, 3, 5, 5, 5, 5, 7, 0, 2, 0, 1, 0\n"+
				"0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 6, 0\n"+
				"0,10, 5, 5, 5,11, 0, 8, 5, 5, 5, 5,15, 5, 5, 5, 5, 7, 0,12, 5, 5, 5, 9, 0\n"+
				"0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 6, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0\n"+
				"0, 1, 0, 1, 0, 6, 0, 2, 0, 8, 7, 0, 6, 0, 8, 7, 0, 2, 0, 6, 0, 1, 0, 1, 0\n"+
				"0, 6, 0, 2, 0, 2, 0, 0, 0,12,11, 0, 2, 0,12,11, 0, 0, 0, 2, 0, 2, 0, 6, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 1, 0,12,11, 0, 0, 0,12,11, 0, 1, 0, 0, 0, 0, 0, 6, 0\n"+
				"0,12, 5, 5, 5, 4, 0, 6, 0,12,11, 0, 1, 0,12,11, 0, 6, 0, 3, 5, 5, 5,11, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 6, 0,12,11, 0, 2, 0,12,11, 0, 6, 0, 0, 0, 0, 0, 6, 0\n"+
				"0,12, 5, 5, 5, 4, 0, 6, 0,12,11, 0, 0, 0,12,11, 0, 6, 0, 3, 5, 5, 5,11, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 2, 0,12,11, 0, 1, 0,12,11, 0, 2, 0, 0, 0, 0, 0, 6, 0\n"+
				"0, 6, 0, 1, 0, 1, 0, 0, 0,12,11, 0, 6, 0,12,11, 0, 0, 0, 1, 0, 1, 0, 6, 0\n"+
				"0, 2, 0, 2, 0, 6, 0, 1, 0,10, 9, 0, 6, 0,10, 9, 0, 1, 0, 6, 0, 2, 0, 2, 0\n"+
				"0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 6, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0\n"+
				"0, 8, 5, 5, 5,11, 0,10, 5, 5, 5, 5,15, 5, 5, 5, 5, 9, 0,12, 5, 5, 5, 7, 0\n"+
				"0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 6, 0\n"+
				"0, 2, 0, 1, 0,10, 5, 5, 5, 5, 4, 0, 6, 0, 3, 5, 5, 5, 5, 9, 0, 1, 0, 2, 0\n"+
				"0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0\n"
				break;
			case 5: 
				var map = 	
				"0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n"+ 
				"0, 8, 5, 5, 5, 4, 0, 1, 0, 1, 0, 6, 0, 6, 0, 1, 0, 1, 0, 3, 5, 5, 5, 7, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 0, 0, 0, 0, 6, 0\n"+
				"0, 6, 0, 8, 5, 5, 5, 9, 0, 6, 0, 6, 0, 6, 0, 6, 0,10, 5, 5, 5, 7, 0, 6, 0\n"+
				"0, 2, 0, 6, 0, 0, 0, 0, 0, 6, 0, 6, 0, 6, 0, 6, 0, 0, 0, 0, 0, 6, 0, 2, 0\n"+
				"0, 0, 0, 6, 0, 8, 5, 5, 5, 9, 0, 2, 0, 2, 0,10, 5, 5, 5, 7, 0, 6, 0, 0, 0\n"+
				"0, 3, 5, 9, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0,10, 5, 4, 0\n"+
				"0, 0, 0, 0, 0, 6, 0, 8, 5, 4, 0, 1, 0, 1, 0, 3, 5, 7, 0, 6, 0, 0, 0, 0, 0\n"+
				"5, 5, 5, 5, 5, 9, 0, 6, 0, 0, 0, 6, 0, 6, 0, 0, 0, 6, 0,10, 5, 5, 5, 5, 5\n"+
				"0, 0, 0, 0, 0, 0, 0, 6, 0, 3, 5,15, 5,15, 5, 4, 0, 6, 0, 0, 0, 0, 0, 0, 0\n"+
				"5, 5, 5, 5, 5, 7, 0, 6, 0, 0, 0, 6, 0, 6, 0, 0, 0, 6, 0, 8, 5, 5, 5, 5, 5\n"+
				"0, 0, 0, 0, 0, 6, 0,10, 5, 4, 0, 2, 0, 2, 0, 3, 5, 9, 0, 6, 0, 0, 0, 0, 0\n"+
				"0, 3, 5, 7, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 8, 5, 4, 0\n"+
				"0, 0, 0, 6, 0,10, 5, 5, 5, 7, 0, 1, 0, 1, 0, 8, 5, 5, 5, 9, 0, 6, 0, 0, 0\n"+
				"0, 1, 0, 6, 0, 0, 0, 0, 0, 6, 0, 6, 0, 6, 0, 6, 0, 0, 0, 0, 0, 6, 0, 1, 0\n"+
				"0, 6, 0,10, 5, 5, 5, 7, 0, 6, 0, 6, 0, 6, 0, 6, 0, 8, 5, 5, 5, 9, 0, 6, 0\n"+
				"0, 6, 0, 0, 0, 0, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 0, 0, 0, 0, 6, 0\n"+
				"0,10, 5, 5, 5, 4, 0, 2, 0, 2, 0, 6, 0, 6, 0, 2, 0, 2, 0, 3, 5, 5, 5, 9, 0\n"+
				"0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n"

				break;
	}

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
