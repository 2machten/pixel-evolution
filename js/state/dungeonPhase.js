var digger;

dungeonPhase = function(game) {
    Phaser.State.call(this); 

    this._map;
    this._game = game;
    this._state = this._game.state.getCurrentState();
    this._game.stage.smoothed = false;
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
    this._map = new WorldMap(this._game, 'level', 'tiles_dungeon', 40, 'collectable_dungeon', 'enemy_dungeon1', 5);

    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items, doors, enemies and keys to the game
    this._game.add.existing(this._map._items);
    this._game.add.existing(this._map._doors);
    this._game.add.existing(this._map._keys);
    this._game.add.existing(this._map._enemies);

    //Instantiate new player object
    
    switch (this._game._level) {
        default:
        case 6: 
            this._player = new Player(this._game, 1, 'player_dungeon1', 120);
            break;
        case 7:
            this._player = new Player(this._game, 1, 'player_dungeon2', 120);
            break;
        case 8:
            this._player = new Player(this._game, 1, 'player_dungeon3', 120);
            break;
    }

    //change the hitarea for collision detection to not adapt the top 8 pixels, this way 
    //the player can walk easier through corridors
    this._player.body.setSize(28,28,0,8); 
    
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
    
    var collectable = this._game.add.sprite(this._game.camera.width - 25, this._game.camera.height - 25, 'collectable_dungeon');
    collectable.anchor.setTo(0.5, 0.5);
    this._collectableText = this._game.add.text(this._game.camera.width - 60, this._game.camera.height - 25, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
    this._collectableText.anchor.setTo(0.5, 0.5);

    var key = this._game.add.sprite(this._game.camera.width - 110, this._game.camera.height - 25, 'key_dungeon');
    key.anchor.setTo(0.5, 0.5);
    this._keyText = this._game.add.text(this._game.camera.width - 145, this._game.camera.height - 25, "0x",{ font: "14px 'Press Start 2P'", fill: "#fff" });
    this._keyText.anchor.setTo(0.5, 0.5);

    this._score.fixedToCamera = true;
    this._score.add(collectable);
    this._score.add(this._collectableText);
    this._score.add(key);
    this._score.add(this._keyText);
    this._game.add.existing(this._score);
};




//Returns a position on the map where an item can spawn
var roomObjectCount = {};
var roomDoorCount = {};
var roomEnemyCount = {};
var roomGenerationCount = 0;
var itemPositions = {};
itemPositions.x = [];
itemPositions.y = [];

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
    var randomPosition = [];
    randomPosition[0] = digger._rooms[i].x + digger._rooms[i].width/2;
    randomPosition[1] = digger._rooms[i].y + digger._rooms[i].height/2;

    return [(randomPosition[0]+1)*40, (randomPosition[1]+1)*40]; //+1 for border tile compensation
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
    var left = room.x + 1; //+1 for border tile compensation
    var right = room.x + room.width;
    var top = room.y + 1;
    var bottom = room.y + room.height;

    var side = Math.floor(ROT.RNG.getUniform() * 4);    
    var x, y;
    var prohibitedx = itemPositions.x;
    var prohibitedy = itemPositions.y; //x and y's from doors: we dont want to have chests spawning there.

    //find all the coordinates of all doors in the current room

    //DENNIS: TODO: DOESNT WORK: DOORS ARENT SPAWNED IN THE ROOM BUT OUTSIDE
    for (var door in room._doors){
        prohibitedx.push(door[0]);
        prohibitedy.push(door[1]);
    }

    //retry when the x and y match a door location. 

    ////////////////////////////////NOTE: super ugly, but functional.
    while((prohibitedx.indexOf(x) != -1 && prohibitedy.indexOf(y) != -1) || typeof x == "undefined"){
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

    itemPositions.x.push(x);
    itemPositions.y.push(y);

    return [x*40 ,y*40];
}

dungeonPhase.prototype.getEnemyPosition = function(){
    //get right room index to put a key at.
    var i = this.getRoom(function(i){
        return (true)});


    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var left = room.x+1; //+1 for border tile compensation
    var right = room.x + room.width;
    var top = room.y+1;
    var bottom = room.y + room.height;

    while((itemPositions.x.indexOf(x) != -1 && itemPositions.y.indexOf(y) != -1) || typeof x == "undefined"){
        var x = left + Math.floor(ROT.RNG.getUniform() * (right - left)); 
        var y = top + Math.floor(ROT.RNG.getUniform() * (bottom - top)); 
    }

    itemPositions.x.push(x);
    itemPositions.y.push(y);

    return [x*40 ,y*40];
}


dungeonPhase.prototype.getKeyPosition = function(){
    //get right room index to put a key at.
    var i = this.getRoom(function(i){
        return ((typeof roomDoorCount[i] == "undefined") /*&& digger._rooms[i].connections.length > 1*/);
    }, roomDoorCount);


    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var left = room.x+1; //+1 for border tile compensation
    var right = room.x + room.width;
    var top = room.y+1;
    var bottom = room.y + room.height;

    while((itemPositions.x.indexOf(x) != -1 && itemPositions.y.indexOf(y) != -1) || typeof x == "undefined"){
        var x = left + Math.floor(ROT.RNG.getUniform() * (right - left)); 
        var y = top + Math.floor(ROT.RNG.getUniform() * (bottom - top)); 
    }

    itemPositions.x.push(x);
    itemPositions.y.push(y);

    return [x*40 ,y*40];
}


dungeonPhase.prototype.getDoorPosition = function(){
    //get right room index to put a door at.
    var i = this.getRoom(function(i){
        return ((typeof roomDoorCount[i] == "undefined") && digger._rooms[i]._doors.length < 2);
    }, roomDoorCount);

    //return a tile against the wall of that room
    var room = digger._rooms[i];

    for (var j = 0; j < room._doors.length; j++){
        var door = room._doors[j];
        return [(door[0]+1) * 40 ,(door[1]+1) * 40];
    }
}

//map generation for dungeon (ROT uniform dungeon algorithm)
dungeonPhase.prototype.generate = function(){
    roomObjectCount = {};
    roomDoorCount = {};

    var w = 80, h = 60;
    digger = new ROT.Map.Rogue(w, h, {
        cellWidth: 4,
        cellHeight: 3,
        roomWidth: [5,9],
        roomHeight: [5,9]
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

    var countSingleDoorRooms;

    //Keep trying to generate the map until there are at least 3 door rooms (door with a single door)
    while(countSingleDoorRooms < 3 || typeof countSingleDoorRooms == "undefined"){
        //create the map
        digger.create(digCallback.bind(this));

        //count the amount of single door rooms
        countSingleDoorRooms = 0;
        for (var a = 0; a < digger.rooms.length; a++){
            for(var b = 0; b < digger.rooms[a].length; b++){
                if(digger.rooms[a][b]._doors.length == 1){
                    countSingleDoorRooms++;
                }
            }
        }

        //in case the digger returns an error, also retry.
        if(digger._error){
            //reset countsingledoor because the room isnt good.
            digger._error = false;
            countSingleDoorRooms = 0;
        }
    }

    //flatten the rooms array
    digger._rooms = [];
    walkLeaves(digger.rooms, function(item, index) {
        digger._rooms.push(item);
    });

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


//helper method to flatten the rooms array
var walkLeaves = function(arr, fn){
    for (var i = 0; i < arr.length; ++i) {
        if (typeof arr[i] == 'object' && arr[i].length) { // simple array check
            walkLeaves(arr[i], fn);
        } else {
            fn(arr[i], i); // only collect leaves
        }
    }
}
