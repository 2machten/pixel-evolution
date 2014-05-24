/**
 * Main game object.
 */
function PixelEvolution()
{
    // game variables
    this.freeTiles = [];
    this.pause = false;

    // init
    this.Keys = Phaser.keyboard;
    this.speed = 3;
    this.layer = "";

    // create
    this.chests = [];

    this.init();
}

PixelEvolution.prototype.generator = function()
{
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
        map.create(digCallback.bind(this));
    }
    //show map in canvas
    document.body.appendChild(display.getContainer());

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

// game initialization

/*
 * NOTE: possibly just move this into the constructor? 
 */
PixelEvolution.prototype.init = function()
{
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render,
        evo: this
    }, /*transparent*/ false, /*antialiasing*/ false);
};

PixelEvolution.prototype.preload = function()
{
    this.game.load.image('chest', 'assets/chest.png');
    this.game.load.spritesheet('player', 'assets/character.png', 79, 95);

    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
    this.game.load.tilemap('level', null, this.evo.generator(), Phaser.Tilemap.CSV);
    this.game.load.image('tiles', 'assets/tiles_32.png');
};

PixelEvolution.prototype.create = function() {
	//game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Modify the world and camera bounds
    //game.world.setBounds(-2000, -2000, 4000, 4000);

    //8Bit mode
    this.game.stage.smoothed = false;
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    //create tiled map
    this.map = this.game.add.tilemap('level', 32, 32);
    this.map.addTilesetImage('tiles');
    this.map.setCollisionBetween(1,200);

    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld(); //??

    //var map = new Map();
    //this.game.add.existing(map.layer);

    //spawn chests
    for (var i=0; i<6; i++){
		var index = Math.floor(ROT.RNG.getUniform() * this.evo.freeTiles.length);
		var randomFreeTile = this.evo.freeTiles.splice(index, 1)[0];
		var chest = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
		this.game.physics.enable(chest);
		this.evo.chests.push(chest);
	}

    //Camera topdown and character
    var index = Math.floor(ROT.RNG.getUniform() * this.evo.freeTiles.length);
    var randomFreeTile = this.evo.freeTiles.splice(index, 1)[0];

    var player = new Player(randomFreeTile[0]*32, randomFreeTile[1]*32); //tile size variable maken??
    this.game.add.existing(player);

    //for (var i = 0; i < 100; i++) {
    //    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    //}
};

PixelEvolution.prototype.update = function() {
};

PixelEvolution.prototype.collisionHandler = function(chest)
{
	this.pause = true;
	alert('hit!');
	chest.destroy();
	this.pause = false;
};

PixelEvolution.prototype.render = function()
{
    //game.debug.cameraInfo(game.camera, 32, 32).style.fontSize = 5;
};

var pixelEvolution = new PixelEvolution();

console.log(pixelEvolution);
