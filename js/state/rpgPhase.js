rpgPhase = function(game) {
    Phaser.State.call(this);

    this._game = game;
    this._freeTiles = [];
    this._game.stage.smoothed = false;
    this._ticks = 0;
}

//Extend the rpgPhase object to be a Phaser.State
rpgPhase.prototype = Object.create(Phaser.State.prototype);
rpgPhase.prototype.constructor = rpgPhase;

rpgPhase.prototype.update = function(){
    var map = this._game.state.getCurrentState()._map;
    var items = map._items;

    //Check whether the collectables are collected,and whether we are not yet in the last level of the phase.
        if(items.children.length == 0 && !ran && this._game._level != 12){
            ran = true;
            run = true;
            this._game._level++;
        }

    this._ticks++;
    if (this._ticks > 500) {
        this._ticks = 0;
        // new random sprite
        var x = Math.floor(Math.random() * (this._game.camera.width / 32)) * 32;
        var y = Math.floor(Math.random() * (this._game.camera.height / 32)) * 32;
        var i = Math.ceil(ROT.RNG.getUniform() * 7);
        var pixie =  this._game.add.sprite(x, y, 'collectable_pixel'+i);
        pixie.scale.setTo(2,2);
        pixie.fixedToCamera = true;
        pixie.bringToTop();
        this._pixies = new Phaser.Group(this._game, null, 'pixies', false);
        this._pixies.add(pixie);
        this._game.add.existing(this._pixies);
    }
}

rpgPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_rpg', 32, 'collectable_rpg', 'enemy_rpg', 5);
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

    //start the right music
    //this._game.music.play('bg4');

    //Instantiate new player object
    this._player = new Player(this._game, 1, 'player_rpg', 150 * 3);
    //change the hitarea for collision detection to not adapt the top 5 pixels, this way
    //the player can walk easier through corridors
    this._player.body.setSize(27,27,0,5);

    this._game.add.existing(this._map._npcs);
    this._game.add.existing(this._map._enemies);

    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {
            self._game.add.existing(self._player);
        }})(this),200);

    this._score = new Phaser.Group(this._game, null, "score", false);

    var collectable = this._game.add.sprite(this._game.camera.width - 25, this._game.camera.height - 25, 'collectable_rpg');
    collectable.anchor.setTo(0.5, 0.5);
    this._collectableText = this._game.add.text(this._game.camera.width - 60, this._game.camera.height - 25, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
    this._collectableText.anchor.setTo(0.5, 0.5);

    var pos = this.getTreePosition();
    var tree = this._game.add.sprite(pos[0], pos[1], 'fragile_tree');

    //display player lives in terms of hearts
    this._hearts = new Phaser.Group(this._game, null, "hearts", false);

    for(var i = 0; i < this._player.hp; i++){
        var heart = this._game.add.sprite(15+(i*35), 15, 'heart');
        heart.scale.setTo(4,4);
        heart.fixedToCamera = true;
        this._hearts.add(heart);
    }
    this._game.add.existing(this._hearts);


    this._score.fixedToCamera = true;
    this._score.add(collectable);
    this._score.add(this._collectableText);
    this._game.add.existing(this._score);
};

//Returns a position on the map where the player or an item can spawn
rpgPhase.prototype.getItemPosition =
rpgPhase.prototype.getEnemyPosition = function(){
    //shuffle the array of free tiles
    shuffle(this._freeTiles);

    //returns an array of x and y position (nth tile) that is free,
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._freeTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}

rpgPhase.prototype.getAxeNpcPosition =
rpgPhase.prototype.getPlayerPosition = function(){
    //shuffle the array of free tiles
    shuffle(this._largestTiles);

    //returns an array of x and y position (nth tile) that is free,
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._largestTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}

rpgPhase.prototype.getTreePosition = function() {
    //shuffle the array of tree tiles
    shuffle(this._treeTiles);

    //returns an array of x and y position (nth tile) that is free,
    //and remove it from the list so no other item can spawn on this position.
    var randomPosition = this._treeTiles.pop();
    return [randomPosition[0]*32, randomPosition[1]*32];
}

/**
 * Get the distance between two tiles.
 */
rpgPhase.prototype.distance = function(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] + b[1]);
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

    // find the largest open fields
    var max = 0;
    var secondMax = 0;
    var largest;
    var secondLargest;
    $.each(fields, function(index, field) {
        if (field.length > max) {
            secondMax = max;
            secondLargest = largest;
            max = field.length;
            largest = field;
        } else if (field.length > secondMax) {
            secondMax = field.length;
            secondLargest = field;
        }
    });

    // create a path between the two largest open fields.
    // we do this by simply selecting two random tiles, and making sure there
    // is a (L-shaped) path between them.

    // however, we want them close to each other, to make sure they are quite close
    // we will take 10000 samples, and take the closest of the two
    var tileA = largest[Math.floor(Math.random() * largest.length)];
    var tileB = secondLargest[Math.floor(Math.random() * secondLargest.length)];
    var closest = this.distance(tileA, tileB);

    for (var i = 0; i < 100000; i++) {
        var tempA = largest[Math.floor(Math.random() * largest.length)];
        var tempB = secondLargest[Math.floor(Math.random() * secondLargest.length)];
        if (this.distance(tempA, tempB) < closest) {
            tileA = tempA;
            tileB = tempB;
            closest = this.distance(tileA, tileB);
        }
    }

    // path of tiles in between
    var path = [];

    for (var i = Math.min(tileA[0], tileB[0]); i < Math.max(tileA[0], tileB[0]); i++) {
        path.push([i, tileA[1]]);
    }
    for (var i = Math.min(tileA[1], tileB[1]); i < Math.max(tileA[1], tileB[1]); i++) {
        path.push([tileB[0], i]);
    }

    this._treeTiles = [];

    // make sure the path is cleared, and select fields that might be good for a tree
    (function(self){$.each(path, function(idx, item) {
        if (map._map[item[0]][item[1]] == 0) {
            map._map[item[0]][item[1]] = 1;
        }
    });
    $.each(path, function(idx, item) {
        var localTiles = [];
        localTiles.push([item[0] + 1, item[1]]);
        localTiles.push([item[0] - 1, item[1]]);
        localTiles.push([item[0], item[1] + 1]);
        localTiles.push([item[0], item[1] - 1]);
        var openCount = 0;
        $.each(localTiles, function(idx, localTile) {
            if (map._map[localTile[0]][localTile[1]] == 0) {
                openCount++;
            }
        });
        if (openCount == 2) {
            self._treeTiles.push(item);
        }
    })})(this);

    // we have more spaaaccee!!
    this._largestTiles = largest;
    this._secondLargestTiles = secondLargest;
    this._freeTiles = largest.concat(secondLargest);

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

    return level;
};


//helper method: shuffles arrays
function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
