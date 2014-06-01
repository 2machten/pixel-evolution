var digger;

dungeonPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
}

//Extend the dungeonPhase object to be a Phaser.State
dungeonPhase.prototype = Object.create(Phaser.State.prototype);
dungeonPhase.prototype.constructor = dungeonPhase;


dungeonPhase.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(
        this._game,             //game
        'level',                //reference to tilemap
        'tiles_dungeon',        //reference to tile images
        32,                     //tileimage dimensions
        this.generate,          //map generation function
        'collectable_dungeon',  //collectable image
        this.getItemPosition    //item position function
    );

    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

    //add doors to the game
    this._game.add.existing(this._map._doors);

    //Instantiate new player object
    this._player = new Player(this._game, 0.6, 'player_dungeon', this.getPlayerPosition);
    
    //postpone character creation for a sec to avoid rendering problems
    setTimeout((function(self) { return function() {  
            self._game.add.existing(self._player);
        }})(this),200); 
};

//Returns a position on the map where the player can spawn
dungeonPhase.prototype.getPlayerPosition = function(){
    //get the index of a random room
    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);
    
    //return the center of htat room
    var randomPosition = digger._rooms[i].getCenter();
    return [(randomPosition[0]+1)*32, (randomPosition[1]+1)*32]; //+1 for border tile compensation
}

//Returns a position on the map where an item can spawn
var roomObjectCount = {};
var roomDoorCount = {};

dungeonPhase.prototype.getRoom = function(condition, log){
    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);

    if(condition(i)){
        //increase log array
        if(typeof log[i] == "undefined"){ log[i] = 1; } else { log[i]++; }
        return i;
    } else {
        return this.getRoom(condition, log);
    }

}

dungeonPhase.prototype.getItemPosition = function(){
    //get right room index to put a door at.
    var i = this.getRoom(function(i){
        //console.log(Object.keys(roomDoorCount).length);
        console.log(Object.keys(roomObjectCount).length);

        if(Object.keys(roomObjectCount).length >= Object.keys(roomDoorCount).length){
            console.log('test');
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

dungeonPhase.prototype.getDoorPosition = function(){
    //get right room index to put a door at.
    var i = this.getRoom(function(i){return ((typeof roomDoorCount[i] == "undefined") && Object.keys(digger._rooms[i]._doors).length < 2);}, roomDoorCount);

    console.log("room " + i + " has a door");
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
    var w = 80, h = 60;
    digger = new ROT.Map.Uniform(w, h, {
        roomWidth: [5,10],
        roomHeight: [5,10],
        roomDugPercentage: 0.12
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

