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
    this._showMinimap = false;

    Phaser.Game.call(this, width, height, renderer, parent, state, transparent, antialias);
}

PixelEvolution.prototype = Object.create(Phaser.Game.prototype);
PixelEvolution.prototype.constructor = PixelEvolution;

function preload()
{
    //all other preloading is done within state (phase) objects.
    this.load.image('logo', 'assets/logo.png');
    this.load.image('background', 'assets/pixel_bg.png');
};

function create()
{
    //8Bit mode: don't smooth edges when scaling objects
    this.stage.smoothed = false;

    //Add all different states/phases
    this.state.add('menu', mainMenu);
    this.state.add('pixel', pixelPhase);
    this.state.add('pacman', pacmanPhase);
    this.state.add('dungeon', dungeonPhase);
    this.state.add('rpg', rpgPhase);

    //and start the menu one
    this.state.start('menu');

    //set up transition plugin to smoothly transition between states.
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

PixelEvolution.prototype.showMessage = function(message){
    var text = this.add.text(this.camera.width / 2, this.camera.height / 2, message, { 
        font: "14px 'Press Start 2P'", 
        fill: "#fff", 
        align: "left",
        stroke: '#000000', 
        strokeThickness: 3
    });

    text.anchor.setTo(0.5, 0.5);
    text.fixedToCamera = true;
    setTimeout(function(){text.destroy();}, 2000);
}


// Instantiate game object.  
var pixelEvolution = new PixelEvolution(800, 600, Phaser.AUTO, 'game', {
        preload: preload,
        create: create
    }, false, false);
    //        NOTE: To use Phaser.AUTO instead of Phaser.CANVAS, you have to run a local server.

// DEBUG: links to change between states/phases manually
$('#menuLink').click(function(){ transitions.to('menu'); });
$('#pixelLink').click(function(){ transitions.to('pixel'); });
$('#pacmanLink').click(function(){ transitions.to('pacman'); });
$('#dungeonLink').click(function(){ transitions.to('dungeon'); });
$('#rpgLink').click(function(){ transitions.to('rpg'); });
