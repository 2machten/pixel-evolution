rpgPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this._freeTiles = [];
}

//Extend the rpgPhase object to be a Phaser.State
rpgPhase.prototype = Object.create(Phaser.State.prototype);
rpgPhase.prototype.constructor = rpgPhase;

rpgPhase.prototype.preload = function(){
}

rpgPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_rpg', 32, this.generate, 'collectable_rpg', this.getItemPosition);
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

    //Instantiate new player object
    this._player = new Player(this._game, 1, 'player_rpg', this.getPlayerPosition);
    
    setTimeout(
        (function(self) {        
            return function() {  
                self._game.add.existing(self._player);
            }
        })(this),
        200
    ); 
};

//Returns a position on the map where the player or an item can spawn
rpgPhase.prototype.getItemPosition = 
rpgPhase.prototype.getPlayerPosition = function(){
    //shuffle the array of free tiles
    shuffle(this._freeTiles);
    
    //returns an array of x and y position (nth tile) that is free, 
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._freeTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}

//map generation for RPG (cellular automata)
rpgPhase.prototype.generate = function(){
    this._freeTiles = [];

    var w = 80, h = 60;
    var map = new ROT.Map.Cellular(w, h, {
        born: [5,6,7,8],
        survive: [4,5,6,7,8]
    });
    map.randomize(0.52);

    var display;
    var digCallback = function(x, y, value) {
        if (value) {
            var tile = [x, y];
            this._freeTiles.push(tile);
        }

        //channel info to debug so the preview can be rendered.
        display.DEBUG(x,y,value);
    }

    //[> generate x generations <]
    for (var i=0; i<10; i++) {
        display = new ROT.Display({width:w, height:h, fontSize:4});

        if(i < 9){
            map.create();
        } else {
            map.create(digCallback.bind(this));
        }
    }
    //show map in canvas
    if (pixelEvolution._showMinimap){
        $('#minimap').html(display.getContainer());
    }

    var level = "";

    for (var i=0; i<map._map[0].length; i++) {
        for (var j=0; j<map._map.length; j++) {
            var point = map._map[j][i]+"";

            if(point=="0"){
                point = "1";
            } else {
                point = "0";
            }

            level += point + ",";
        }
        level += "\n";
    }

    return level;
};


//helper method: shuffles arrays
function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
