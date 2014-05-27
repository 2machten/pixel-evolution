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
    this._pause = false;
    this._showMinimap = false;

    Phaser.Game.call(this, width, height, renderer, parent, state, transparent, antialias);
}

PixelEvolution.prototype = Object.create(Phaser.Game.prototype);
PixelEvolution.prototype.constructor = PixelEvolution;

//preload all sprites in advance before actually starting the game.
function preload()
{
    //general game sprites
    this.load.image('message_bg', 'assets/message_bg.png');
    
    //Main menu sprites
    this.load.image('logo', 'assets/logo.png');
    this.load.image('background', 'assets/pixel_bg.png');

    //Dungeon state sprites
    this.load.spritesheet('player_dungeon', 'assets/character.png', 27, 32);
    this.load.image('tiles_dungeon', 'assets/dungeon_tiles.png');
    this.load.image('collectable_dungeon', 'assets/chest.png');

    //RPG state sprites
    this.load.spritesheet('player_rpg', 'assets/character.png', 27, 32);
    this.load.image('tiles_rpg', 'assets/rpg_tiles.png');
    this.load.image('collectable_rpg', 'assets/chest.png');
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

PixelEvolution.prototype.update = function(time){
    //super(), neccesary for it to function
    Phaser.Game.prototype.update.call(this, time);

    if(this.input.activePointer.isDown && this._bg){ 
        this._bg.destroy();
        this._continue.destroy();
        this._message.destroy();
        this._pause = false;
    }
}

//Displays a message on the screen and 'types it out' (animation).
PixelEvolution.prototype.showMessage = function(message){
    //this._pause = true;

    if(this._bg){ 
        this._bg.destroy();
        this._continue.destroy();
        this._message.destroy();
        this._pause = false;
    }
    

    //show background
    this._bg = this.add.tileSprite(0, this.camera.height-150, this.camera.width, 150, 'message_bg');
    this._bg.scale.setTo(3.2,3.2);
    this._bg.fixedToCamera = true;

    this._continue = this.add.text(this.camera.width - 150, this.camera.height - 30, "Continue..", { font: "14px 'Press Start 2P'", fill: "#000" });
    this._continue.fixedToCamera = true;

    //show text
    this._message = this.add.text(50, this.camera.height - 70, "", { font: "14px 'Press Start 2P'", fill: "#000" });
    this._message.lineSpacing = 7;
    this._message.anchor.setTo(0,0.5);
    this._message.fixedToCamera = true;
    this._message.realMessage = message;

    //type the text out.
    var count = 0;
    var speed = 3;
    this._message.update = function(){
        count++;
        if(count%speed){
            this.setText(this.realMessage.substring(0, Math.round(count/speed)));
        }
    }
}


// Instantiate game object.  
var pixelEvolution = new PixelEvolution(800, 600, Phaser.CANVAS, 'game', {
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
