/**
 * Main game object.
 *
 * This object is also given to Phaser.Game. To make sure it is all
 * compatible, all internal variables and methods are prefixed with _.
 */

var transitions = null;

function PixelEvolution(width, height, renderer, parent, state, transparent, antialias)
{
    // game variables
    this._showMinimap = true;
    this._chests = [];
    this._type = "rpg"; // other option is RPG

    Phaser.Game.call(this, width, height, renderer, parent, state, transparent, antialias);
}

PixelEvolution.prototype = Object.create(Phaser.Game.prototype);
PixelEvolution.prototype.constructor = PixelEvolution;

function preload()
{
    //preloading is done within state (phase) objects.
};

function create()
{
    //8Bit mode: don't smooth edges when scaling objects
    this.stage.smoothed = false;

    //this.state.add('menu', mainMenu);
    //this.state.add('pixel', pixelStage);
    //this.state.add('pacman', pacmanStage);
    this.state.add('dungeon', dungeonStage);
    this.state.add('rpg', rpgStage);

    this.state.start('rpg');

    transitions = this.game.plugins.add(Phaser.Plugin.StateTransition);
    transitions.settings({
        duration: 700,
        properties: {
            alpha: 0,
            scale: {
                x: 1.5,
                y: 1.5
            }
        }
    });
};

//updates usually get handled by smaller classes like Player.
function update()
{
};

function render()
{
    //Show camera debug info.
    //this.debug.cameraInfo(this.camera, 32, 32);
};




//instantiate Phaser game object
// We use Phaser.CANVAS for development. We will set it later to
// Phaser.AUTO for performance

var pixelEvolution = new PixelEvolution(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
}, false, false);

$('#dungeonLink').click(function(){
    transitions.to('dungeon');
});

$('#rpgLink').click(function(){
    transitions.to('rpg');
});
