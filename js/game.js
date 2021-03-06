/**
 * Main game object.
 */

var transitions = null;
var run = false;
var ran = false;


function PixelEvolution(width, height, renderer, parent, state, transparent, antialias)
{
    // game variables
    this._pause = false;
    this._showMinimap = false;

    this._level = 0;
    Phaser.Game.call(this, width, height, renderer, parent, state, transparent, antialias);
}

PixelEvolution.prototype = Object.create(Phaser.Game.prototype);
PixelEvolution.prototype.constructor = PixelEvolution;

//preload all sprites in advance before actually starting the game.
function preload(){
};

function create()
{
    //Add all different states/phases
    //general
    this.state.add('boot', boot);
    this.state.add('loader', loader);
    this.state.add('menu', mainMenu);
    this.state.add('evolution', evolution);
    this.state.add('end', end);

    //phases
    this.state.add('pixel', pixelPhase);
    this.state.add('pacman', pacmanPhase);
    this.state.add('dungeon', dungeonPhase);
    this.state.add('rpg', rpgPhase);

    //initialise music
    pixelEvolution._music = this.add.audio('music');
    pixelEvolution._sfx = this.add.audio('music');

    pixelEvolution._music.addMarker('8bbg1', 41.629, 7.696, 1, true);
    pixelEvolution._music.addMarker('bg1', 0.028, 10.216, 1, true);
    pixelEvolution._music.addMarker('bg2', 10.244, 10.214, 1, true);
    pixelEvolution._music.addMarker('bg3', 20.458, 10.238, 1, true);
    pixelEvolution._music.addMarker('bg4', 30.696, 10.188, 1, true);

    pixelEvolution._sfx.addMarker('chat', 40.884, 0.314, 1, false);
    pixelEvolution._sfx.addMarker('itempickup', 41.198, 0.494, 1, false);
    
    //and start the menu one
    this.state.start('boot');

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

    if(run) {
        run = false;
        this.switchLevel();
        
    }

    if((this.input.activePointer.isDown || this.input.keyboard.isDown(Phaser.Keyboard.ENTER) || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) && this._bg){
        this._bg.destroy();
        this._continue.destroy();
        this._message.destroy();
        this._pause = false;
    }
}


PixelEvolution.prototype.switchLevel = function() {
    switch(this._level) {
        case 1: transitions.to('pixel');
                console.log("level1");
                ran = false;
                break;
        case 2: transitions.to('pixel');
                console.log("level2");
                ran = false;
                break;
        case 3: transitions.to('evolution');
                console.log("level3");
                ran = false;
                break;
        case 4: transitions.to('pacman');
                console.log("level4");
                ran = false;
                break;
        case 5: transitions.to('pacman');
                console.log("level5");
                ran = false;
                break;
        case 6: transitions.to('evolution');
                console.log("level6");
                ran = false;
                break;
        case 7: transitions.to('dungeon');
                console.log("level7");
                ran = false;
                break;                
        case 8: transitions.to('dungeon');
                console.log("level8");
                ran = false;
                break;
        case 9: transitions.to('evolution');
                console.log("level9");
                ran = false;
                break;
        case 10: transitions.to('end');
                console.log("Fin");
                break;
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

    //this._continue = this.add.text(this.camera.width - 150, this.camera.height - 30, "Continue..", { font: "14px 'Press Start 2P'", fill: "#000" });
    this._continue = this.add.sprite(this.camera.width - 20, this.camera.height - 15, 'space');
    this._continue.fixedToCamera = true;
    this._continue.anchor.setTo(1,1);
    this._continue.scale.setTo(1.25, 1.25);

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
var pixelEvolution = new PixelEvolution(800, 608, Phaser.AUTO, 'game', {
    preload: preload,
    create: create
}, false, true);
//        NOTE: To use Phaser.AUTO instead of Phaser.CANVAS, you have to run a local server.


// DEBUG: links to change between states/phases manually
$('#menuLink').click(function(){    pixelEvolution._level = 0; transitions.to('menu'); });

$('#pixelLink1').click(function(){   pixelEvolution._level = 0; transitions.to('pixel'); });
$('#pixelLink2').click(function(){   pixelEvolution._level = 1; transitions.to('pixel'); });
$('#pixelLink3').click(function(){   pixelEvolution._level = 2; transitions.to('pixel'); });

$('#pacmanLink1').click(function(){  pixelEvolution._level = 3; transitions.to('pacman'); });
$('#pacmanLink2').click(function(){  pixelEvolution._level = 4; transitions.to('pacman'); });
$('#pacmanLink3').click(function(){  pixelEvolution._level = 5; transitions.to('pacman'); });

$('#dungeonLink1').click(function(){ pixelEvolution._level = 6; transitions.to('dungeon'); });
$('#dungeonLink2').click(function(){ pixelEvolution._level = 7; transitions.to('dungeon'); });
$('#dungeonLink3').click(function(){ pixelEvolution._level = 8; transitions.to('dungeon'); });

$('#rpgLink').click(function(){     pixelEvolution._level = 9; transitions.to('rpg'); });

