/**
 * Main game object.
 */
function PixelEvolution()
{
    // game variables
    this.pause = false;
    this.chests = [];

    //instantiate Phaser game object
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {  /////////////////CAN EVENTUALLY BE AUTO (webgl), BUT CANVAS IS NICER FOR DEVVING (no tainted canvas warnings)
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render,
        evo: this
    }, /*transparent*/ false, /*antialiasing*/ false);
}

PixelEvolution.prototype.preload = function()
{
    this.game.load.image('chest', 'assets/chest.png');
    this.game.load.spritesheet('player', 'assets/character.png', 79, 95);
    this.game.load.image('tiles', 'assets/tiles_32.png');
};

PixelEvolution.prototype.create = function() 
{
    //8Bit mode: don't smooth edges when scaling objects
    this.game.stage.smoothed = false;

    //instantiate worldmap and create layer (this displays the map)
    this.evo.worldMap = new WorldMap("rpg");
    this.evo.layer = this.evo.worldMap.map.createLayer(0);
    this.evo.layer.resizeWorld();

    //spawn chests
    for (var i=0; i<6; i++){
		var index = Math.floor(ROT.RNG.getUniform() *  this.evo.worldMap.freeTiles.length);
		var randomFreeTile = this.evo.worldMap.freeTiles.splice(index, 1)[0];
		var chest = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
		this.game.physics.enable(chest);
		this.evo.chests.push(chest);
	}

    //Instantiate new player object
    var player = new Player();
    this.game.add.existing(player);
};

//updates usually get handled by smaller classes like Player.
PixelEvolution.prototype.update = function() 
{
};

PixelEvolution.prototype.render = function()
{
    //Show camera debug info.
    //this.game.debug.cameraInfo(this.game.camera, 32, 32);
};

//3..2..1.. Take off!
var pixelEvolution = new PixelEvolution();


