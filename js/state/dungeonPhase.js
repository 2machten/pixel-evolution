var digger;

dungeonStage = function(game) {
    Phaser.State.call(this); 

    this.game = game;
    this.freeTiles = [];
}

//Extend the player object to be a Phaser.State
dungeonStage.prototype = Object.create(Phaser.State.prototype);
dungeonStage.prototype.constructor = dungeonStage;


dungeonStage.prototype.preload = function(){
    this.game.stage.backgroundColor = '#27672f';
    this.load.spritesheet('player', 'assets/character.png', 79, 95);
    this.game.load.image('tiles', 'assets/dungeon_tiles.png');

}

dungeonStage.prototype.create = function(){
    //instantiate worldmap and create layer (this displays the map)
    this._map = new WorldMap(this.game, 'level', 32, 32, this.generate);
    this._map.addTilesetImage('tiles');
    this._layer = this._map.createLayer(0);
    this._layer.resizeWorld();

    //spawn chests
    /*for (var i=0; i<6; i++){
        var index = Math.floor(ROT.RNG.getUniform() *  this._worldMap.freeTiles.length);
        var randomFreeTile = this._worldMap.freeTiles.splice(index, 1)[0];
        var chest = this.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
        this.physics.enable(chest);
        this._chests.push(chest);
    }*/

    //Instantiate new player object
    this._player = new Player(this.game, 0.25, this.getPlayerPosition);
    this.game.add.existing(this._player);
};

dungeonStage.prototype.getPlayerPosition = function(){
    //get the index of a random room
    var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);
    
    //return the center of htat room
    return digger._rooms[i].getCenter();
}

//map generation for dungeon (ROT uniform dungeon algorithm)
dungeonStage.prototype.generate = function()
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
                    } else if(terrainMap[j+1][i] == 1){ //right V
                        point = "57";
                    } else if(terrainMap[j-1][i] == 1){ //left V
                        point = "59";
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

