var digger;

dungeonPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
}

//Extend the dungeonPhase object to be a Phaser.State
dungeonPhase.prototype = Object.create(Phaser.State.prototype);
dungeonPhase.prototype.constructor = dungeonPhase;

dungeonPhase.prototype.update = function(){
    var map = this._game.state.getCurrentState()._map;
    var items = map._items;

    //Check whether the collectables are collected, and whether we are not yet in the last level of the phase.
    if(items.children.length == 0 && !ran && this._game._level != 9){
        ran = true;
        run = true;
        this._game._level++;
    }
}

dungeonPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this._game, 'level', 'tiles_dungeon', 32, 'collectable_dungeon');

    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items, doors and keys to the game
    this._game.add.existing(this._map._items);
    this._game.add.existing(this._map._doors);
    this._game.add.existing(this._map._keys);

    //Instantiate new player object
    this._player = new Player(this._game, 0.6, 'player_dungeon', this.getPlayerPosition, 190);
    
    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {  
            self._game.add.existing(self._player);
        }})(this),200); 


    //display player lives in terms of hearts
    this._hearts = new Phaser.Group(this._game, null, "hearts", false);
    
    for(var i = 0; i < this._player.hp; i++){
        var heart = this._game.add.sprite(15+(i*35), 15, 'heart');
        heart.scale.setTo(4,4);
        heart.fixedToCamera = true;
        this._hearts.add(heart);
    }
    this._game.add.existing(this._hearts);

    //display player lives in terms of hearts
    this._score = new Phaser.Group(this._game, null, "score", false);
    
    var collectable = this._game.add.sprite(this._game.camera.width - 15, this._game.camera.height - 15, 'collectable_dungeon');
    collectable.anchor.setTo(1,1);
    var text = this._game.add.text(this._game.camera.width - 50, this._game.camera.height - 22, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
    text.anchor.setTo(1,1);

    var key = this._game.add.sprite(this._game.camera.width - 100, this._game.camera.height - 15, 'key_dungeon');
    key.anchor.setTo(1,1);
    var text2 = this._game.add.text(this._game.camera.width - 135, this._game.camera.height - 22, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
    text2.anchor.setTo(1,1);

    this._score.fixedToCamera = true;
    this._score.add(collectable);
    this._score.add(text);
    this._score.add(key);
    this._score.add(text2);
    this._game.add.existing(this._score);
};




//Returns a position on the map where an item can spawn
var roomObjectCount = {};
var roomDoorCount = {};

dungeonPhase.prototype.getRoom = function(condition, log){
    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);

    if(condition(i)){
        //increase log array
        if(log != null){
            if(typeof log[i] == "undefined"){ log[i] = 1; } else { log[i]++; }
        }

        return i;
    } else {
        return this.getRoom(condition, log);
    }
}

//Returns the middle of a room that has not have a locked door.
dungeonPhase.prototype.getPlayerPosition = function(){
    //get the index of a random room
    var i = this.getRoom(function(i){
        return (typeof roomDoorCount[i] == "undefined");
    }, null);
    
    //return the center of htat room
    var randomPosition = digger._rooms[i].getCenter();
    return [(randomPosition[0]+1)*32, (randomPosition[1]+1)*32]; //+1 for border tile compensation
}

//return the sides of a room where that has a locked door if those are available.
//this never spawns a second chest in a room either.
dungeonPhase.prototype.getItemPosition = function(){
    //get right room index to put a door at.
    var i = this.getRoom(function(i){
        if(Object.keys(roomObjectCount).length >= Object.keys(roomDoorCount).length){
            return ((typeof roomObjectCount[i] == "undefined"));
        } else {
            return ((roomDoorCount[i] > 0) && (typeof roomObjectCount[i] == "undefined"));
        }
    }, roomObjectCount);

    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var left = room.getLeft()+1; //+1 for border tile compensation
    var right = room.getRight()+1;
    var top = room.getTop()+1;
    var bottom = room.getBottom()+1;

    var side = Math.floor(ROT.RNG.getUniform() * 4);    
    var x, y;
    var prohibitedx = [];
    var prohibitedy = []; //x and y's from doors: we dont want to have chests spawning there.

    //find all the coordinates of all doors in the current room
    for (var door in room._doors){
        var coords = door.split(',');
        prohibitedx.push(coords[0]);
        prohibitedy.push(coords[1]);
    }

    //retry when the x and y match a door location. 

    ////////////////////////////////NOTE: super ugly, but functional.
    while((prohibitedx.indexOf(x) != -1 && prohibitedy.contains(y) != -1) || typeof x == "undefined"){
        switch(side){
            case 0: //left wall
                x = left;
                y = top + Math.floor(ROT.RNG.getUniform() * (bottom-top));
                break;
            case 1: //right wall
                x = right;
                y = top + Math.floor(ROT.RNG.getUniform() * (bottom-top));
                break;
            case 2: //top wall
                x = left + Math.floor(ROT.RNG.getUniform() * (right-left));
                y = top;
                break;
            case 3: //bottom wall
                x = left + Math.floor(ROT.RNG.getUniform() * (right-left));
                y = bottom;
                break;
        }
    }

    return [x*32 ,y*32];
}

dungeonPhase.prototype.getKeyPosition = function(){
    //get right room index to put a key at.
    var i = this.getRoom(function(i){
        return ((typeof roomDoorCount[i] == "undefined") && Object.keys(digger._rooms[i]._doors).length > 1);
    }, roomDoorCount);


    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var left = room.getLeft()+1; //+1 for border tile compensation
    var right = room.getRight()+1;
    var top = room.getTop()+1;
    var bottom = room.getBottom()+1;

    var x = left + Math.floor(ROT.RNG.getUniform() * (right - left)); 
    var y = top + Math.floor(ROT.RNG.getUniform() * (bottom - top)); 

    return [x*32 ,y*32];
}


dungeonPhase.prototype.getDoorPosition = function(){
    //get right room index to put a door at.
    var i = this.getRoom(function(i){
        return ((typeof roomDoorCount[i] == "undefined") && Object.keys(digger._rooms[i]._doors).length < 2);
    }, roomDoorCount);

    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var x,y;
    for (var door in room._doors){
        var coords = door.split(',');
        x = parseInt(coords[0])+1;
        y = parseInt(coords[1])+1;

        
        return [x*32 ,y*32];
    }
}

//map generation for dungeon (ROT uniform dungeon algorithm)
dungeonPhase.prototype.generate = function()
{
    roomObjectCount = {};
    roomDoorCount = {};

    var w = 80, h = 60;
    digger = new ROT.Map.Uniform(w, h, {
        roomWidth: [5,7],
        roomHeight: [5,7],
        roomDugPercentage: 0.13
    });
    //map.randomize(0.52);

    var display;
    var terrainMap = [];

    var digCallback = function(x, y, value) {
        if(terrainMap[x+1] == null){
            terrainMap[x+1] = ["border",]; //add row to the TOP of the map
        }

        terrainMap[x+1][y+1] = value; //+1 for border tile compensation

        //channel info to debug so the preview can be rendered.
        display.DEBUG(x,y,value);
    }

    display = new ROT.Display({width:w, height:h, fontSize:4});
    digger.create(digCallback.bind(this));

    //add a column to the LEFT of the map
    terrainMap[0] = [];
    for(var i = 0; i < terrainMap[1].length; i++){ terrainMap[0].push("border"); }

    //add a column to the RIGHT of the map
    terrainMap[terrainMap.length-1] = [];
    for(var i = 0; i < terrainMap[1].length; i++){ terrainMap[terrainMap.length-1].push("border"); }
        terrainMap[terrainMap.length-1] = [];
    for(var i = 0; i < terrainMap[1].length; i++){ terrainMap[terrainMap.length-1].push("border"); }

    //add a row to the BOTTOM of the map
    for(var i = 0; i < terrainMap.length; i++){ terrainMap[i].push("border"); }

    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);
    startLocation = digger._rooms[i].getCenter();

    //show map in canvas
    if (pixelEvolution._showMinimap){
        $('#minimap').html(display.getContainer());
    }

    var level = "";

    for (var i=0; i<terrainMap[0].length; i++) {
        for (var j=0; j<terrainMap.length; j++) {
            if (terrainMap[j][i] == "0"){
                terrainMap[j][i] = "1";
            } else if (terrainMap[j][i] == "1"){
                terrainMap[j][i] = "0";
            }
        }
    }

    //Remove single outliers
    /*for (var i=0; i<terrainMap[0].length; i++) {
      for (var j=0; j<terrainMap.length; j++) {
      var point = terrainMap[j][i]+"";

      try{
      if(terrainMap[j-1][i] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i+1] == 1){
      terrainMap[j][i] = "1";
      } else if(terrainMap[j-1][i] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i-1] == 1){
      terrainMap[j][i] = "1";
      }

      if(terrainMap[j][i+1] == 1 && terrainMap[j][i-1] == 1 && terrainMap[j+1][i] == 1){
      terrainMap[j][i] = "1";
      } else if(terrainMap[j][i+1] == 1 && terrainMap[j][i-1] == 1 && terrainMap[j-1][i] == 1){
      terrainMap[j][i] = "1";
      }
      } catch(e){}
      }
      }*/

    for (var i=0; i<terrainMap[0].length; i++) {
        for (var j=0; j<terrainMap.length; j++) {
            var point = terrainMap[j][i]+"";

            if(point=="0" || point=="border"){
                try{
                    if(terrainMap[j-1][i+1] == 1 && terrainMap[j-1][i] == 1 && terrainMap[j][i+1] == 1){ //bottom left corner outward
                        point = "66";
                    } else if(terrainMap[j-1][i-1] == 1 && terrainMap[j-1][i] == 1 && terrainMap[j][i-1] == 1){ //top left corner outward
                        point = "64";
                    } else if(terrainMap[j+1][i+1] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i+1] == 1){ //bottom right corner outward
                        point = "65";
                    } else if(terrainMap[j+1][i-1] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i-1] == 1){ //top right corner outward
                        point = "63";
                    } else if(terrainMap[j-1][i] == 1){ //left V
                        point = "59";
                        } else if(terrainMap[j+1][i] == 1){ //right V
                        point = "57";
                    
                    } else if(terrainMap[j][i-1] == 1){ //bottom V
                        point = "61";
                    } else if(terrainMap[j][i+1] == 1){ //top V
                        point = "55";
                    } else if(terrainMap[j-1][i+1] == 1){ //bottom left corner
                        point = "56";
                    } else if(terrainMap[j-1][i-1] == 1){ //bottom right corner
                        point = "62";
                    } else if(terrainMap[j+1][i+1] == 1){ //top left corner
                        point = "54";
                    } else if(terrainMap[j+1][i-1] == 1){ //top right corner
                        point = "60";
                    } else {
                        point = "25";
                    }

                }catch(e){
                    point = "25";
                }
            } else {
                point = "0";
            }

            level += point + ",";
        }
        level = level.substring(0,level.length-1) + "\n";
    }

    return level;
}

