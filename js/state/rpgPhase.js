rpgStage = function(game) {
    Phaser.State.call(this); 

    this.game = game;
    this.freeTiles = [];
}

//Extend the player object to be a Phaser.State
rpgStage.prototype = Object.create(Phaser.State.prototype);
rpgStage.prototype.constructor = rpgStage;


rpgStage.prototype.preload = function(){
    this.game.stage.backgroundColor = '#6db523';
    this.load.spritesheet('player', 'assets/character.png', 79, 95);
    this.game.load.image('tiles', 'assets/rpg_tiles.png');

}

rpgStage.prototype.create = function(){
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
    this._player = new Player(this.game, 0.35, this.getPlayerPosition);
    this.game.add.existing(this._player);
};

rpgStage.prototype.getPlayerPosition = function(){
    var index = Math.floor(ROT.RNG.getUniform() * this.freeTiles.length);
    
    //returns an array of x and y position (nth tile) that is free.
    return this.freeTiles.splice(index, 1)[0];
}

//map generation for RPG (cellular automata)
rpgStage.prototype.generate = function()
{
    this.freeTiles = [];
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
            this.freeTiles.push(tile);
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
