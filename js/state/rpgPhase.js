rpgPhase = function(game) {
    Phaser.State.call(this);

    this._game = game;
    this._freeTiles = [];
}

//Extend the rpgPhase object to be a Phaser.State
rpgPhase.prototype = Object.create(Phaser.State.prototype);
rpgPhase.prototype.constructor = rpgPhase;

rpgPhase.prototype.update = function(){
    //Check whether the collectables are collected,and whether we are not yet in the last level of the phase.
        if(items.children.length == 0 && !this.ran && this._game._level != 11){
            console.log("Next level");
            this.ran = true;
            run = true;
            this._game._level++;
            console.log(this._game._level);
        } 
}

rpgPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_rpg', 32, this.generate, 'collectable_rpg');
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

    //Instantiate new player object
    this._player = new Player(this._game, 1, 'player_rpg');

    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {
            self._game.add.existing(self._player);
        }})(this),200);
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
            var tile = [x, y+1]; //+1 for border tile compensation
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

    //add a row to the TOP of the map
    for(var i = 0; i < map._map.length; i++){ map._map[i].unshift("border"); }

    //add a column to the LEFT of the map
    map._map[0] = [];
    for(var i = 0; i < map._map[1].length; i++){ map._map[0].push("border"); }

    //add a column to the RIGHT of the map
    map._map[map._map.length-1] = [];
    for(var i = 0; i < map._map[1].length; i++){ map._map[map._map.length-1].push("border"); }

    //add a row to the BOTTOM of the map
    for(var i = 0; i < map._map.length; i++){ map._map[i].push("border"); }

    //show map in canvas
    if (pixelEvolution._showMinimap){
        $('#minimap').html(display.getContainer());
    }

    var level = "";

    for (var i=0; i<map._map[0].length; i++) {
        for (var j=0; j<map._map.length; j++) {
            var point = map._map[j][i]+"";

            if(point=="0" || point=="border"){
                point = "1";
            } else {
                point = "0";
            }

            level += point + ",";
        }
        level = level.substring(0,level.length-1) + "\n";
    }

    // calculate the biggest part of the map where we can freely move around
    var union = new UnionFind(this._freeTiles.length);

    // the sets are already made, create reverse free tiles

    var h = map._map.length;
    var w = map._map[0].length;

    var rFreeTiles = new Array(h);
    for (var i = 0; i < h; i++) {
        rFreeTiles[i] = new Array(w);
    }

    for (var i = 0; i < this._freeTiles.length; i++) {
        var tile = this._freeTiles[i];
       rFreeTiles[tile[0]][tile[1]] = i;
    }

    // now, unionize all free tiles together

    for (var i = 0; i < this._freeTiles.length; i++) {
        var tile = this._freeTiles[i];
        if (tile[0] > 0) {
            var val = map._map[tile[0] - 1][tile[1]];
            if (val == '1') {
                union.link(i, rFreeTiles[tile[0] - 1][tile[1]]);
            }
        }
        if (tile[0] < h - 1) {
            var val = map._map[tile[0] + 1][tile[1]];
            if (val == '1') {
                union.link(i, rFreeTiles[tile[0] + 1][tile[1]]);
            }
        }
        if (tile[1] > 0) {
            var val = map._map[tile[0]][tile[1] - 1];
            if (val == '1') {
                union.link(i, rFreeTiles[tile[0]][tile[1] - 1]);
            }
        }
        if (tile[1] < w - 1) {
            var val = map._map[tile[0]][tile[1] + 1];
            if (val == '1') {
                union.link(i, rFreeTiles[tile[0]][tile[1] + 1]);
            }
        }
    }

    // find all open fields
    var fields = {};

    for (var i = 0; i < this._freeTiles.length; i++) {
        var field = union.find(i);
        if (!(field in fields)) {
            fields[field] = [];
        }
        fields[field].push(this._freeTiles[i]);
    }

    // find the largest open field
    var max = 0;
    var largest;
    $.each(fields, function(index, field) {
        if (field.length > max) {
            max = field.length;
            largest = field;
        }
    });

    this._freeTiles = largest;

    return level;
};


//helper method: shuffles arrays
function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
