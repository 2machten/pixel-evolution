/**
 * Main game object.
 *
 * This object is also given to Phaser.Game. To make sure it is all
 * compatible, all internal variables and methods are prefixed with _.
 */
function PixelEvolution()
{
    // game variables
    this._pause = false;
    this._chests = [];
    this._type = "rpg"; // other option is RPG

    //instantiate Phaser game object
    // We use Phaser.CANVAS for development. We will set it later to
    // Phaser.AUTO for performance
    this._game = new Phaser.Game(800, 600, Phaser.CANVAS,
        'game', this, /*transparent*/ false, /*antialiasing*/ false);
}

PixelEvolution.prototype.preload = function()
{
    if (this._type == 'rpg') {
        this._game.load.image('chest', 'assets/chest.png');
        this._game.load.spritesheet('player', 'assets/character.png', 79, 95);
        this._game.load.image('tiles', 'assets/tiles_32.png');
    } else if (this._type == 'dungeon') {
        this._game.load.image('mushroom', 'assets/melon.png');
        this._game.load.image('phaser', 'assets/melon.png');
        this._game.load.image('tiles', 'assets/catastrophi_tiles_16.png');
    }
};

PixelEvolution.prototype.create = function()
{
    //8Bit mode: don't smooth edges when scaling objects
    this._game.stage.smoothed = false;

    //instantiate worldmap and create layer (this displays the map)
    this._worldMap = new WorldMap(this._type);
    this._layer = this._worldMap.map.createLayer(0);
    this._layer.resizeWorld();

    if (this._type == 'rpg') {
        //spawn chests
        for (var i=0; i<6; i++){
            var index = Math.floor(ROT.RNG.getUniform() *  this._worldMap.freeTiles.length);
            var randomFreeTile = this._worldMap.freeTiles.splice(index, 1)[0];
            var chest = this._game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
            this._game.physics.enable(chest);
            this._chests.push(chest);
        }

        //Instantiate new player object
        var player = new Player();
        this._game.add.existing(player);
    }
};

//updates usually get handled by smaller classes like Player.
PixelEvolution.prototype.update = function()
{
};

PixelEvolution.prototype.render = function()
{
    //Show camera debug info.
    //this._game.debug.cameraInfo(this._game.camera, 32, 32);
};

//3..2..1.. Take off!
var pixelEvolution = new PixelEvolution();


