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
    this._map = new WorldMap(this._game, 'level', 'tiles_dungeon', 32, this.generate, 'collectable_dungeon', this.getItemPosition);
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //add items to the game
    this._game.add.existing(this._map._items);

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
    return [randomPosition[0]*32, randomPosition[1]*32];
}

//Returns a position on the map where an item can spawn
dungeonPhase.prototype.getItemPosition = function(){
    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);
    
    //return a tile against the wall of that room
    var room = digger._rooms[i];
    var left = room.getLeft();
    var right = room.getRight();
    var top = room.getTop();
    var bottom = room.getBottom();

    var side = Math.floor(ROT.RNG.getUniform() * 4);    
    var x, y;

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

    return [x*32 ,y*32];
}

//map generation for dungeon (ROT uniform dungeon algorithm)
dungeonPhase.prototype.generate = function()
{
    var w = 80, h = 60;
    digger = new ROT.Map.Uniform(w, h, {
        roomWidth: [5,10],
       roomHeight: [5,10],
       roomDugPercentage: 0.10
    });
    //map.randomize(0.52);

    var display;
    var terrainMap = [];

    var digCallback = function(x, y, value) {
        if(terrainMap[x] == null){
            terrainMap[x] = [];
        }

        terrainMap[x][y] = value;

        //channel info to debug so the preview can be rendered.
        display.DEBUG(x,y,value);
    }

    display = new ROT.Display({width:w, height:h, fontSize:4});
    digger.create(digCallback.bind(this));

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

            if(point=="0"){
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
        level += "\n";
    }

    return level;
}

