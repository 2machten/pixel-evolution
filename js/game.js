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
function preload()
{
    //general game sprites
    this.load.image('message_bg', 'assets/message_bg.png');
    this.load.spritesheet('heart', 'assets/heart.png', 8, 7);
    
    //Main menu sprites
    this.load.image('logo', 'assets/logo.png');
    this.load.image('background', 'assets/pixel_bg.png');

    //Pixel state sprites
    this.load.spritesheet('player_pixel1', 'assets/character_pixel.png', 16, 16);
    this.load.spritesheet('player_pixel2', 'assets/character_pixel2.png', 90, 90);
    this.load.spritesheet('player_pixel3', 'assets/character_pixel3.png', 90, 90);
    this.load.image('tiles_pixel', 'assets/tiles_pixel.png');
    this.load.image('collectable_pixel1', 'assets/collectable_pixel1.png');
    this.load.image('collectable_pixel2', 'assets/collectable_pixel2.png');
    this.load.image('collectable_pixel3', 'assets/collectable_pixel3.png');
    this.load.image('collectable_pixel4', 'assets/black_pixel.png');

    //Pacman state sprites
    this.load.spritesheet('player_pacman1', 'assets/character_pacman.png', 18, 18);
    this.load.spritesheet('player_pacman2', 'assets/character_pacman2.png', 24, 24);
    this.load.spritesheet('player_pacman3', 'assets/character_pacman3.png', 24, 24);
    this.load.spritesheet('enemy_pacman1', 'assets/enemy_01.png', 32, 32);
    this.load.spritesheet('enemy_pacman2', 'assets/enemy_02.png', 32, 32);
    this.load.spritesheet('enemy_pacman3', 'assets/enemy_03.png', 32, 32);
    this.load.spritesheet('enemy_pacman4', 'assets/enemy_04.png', 32, 32);
    this.load.image('tiles_pacman', 'assets/tiles_pacman.png');
    this.load.image('collectable_pacman', 'assets/collectable_pacman.png');

    //Dungeon state sprites
    this.load.spritesheet('player_dungeon1', 'assets/character_dungeon1.png', 28, 36);
    this.load.spritesheet('player_dungeon2', 'assets/character_dungeon2.png', 28, 36);
    this.load.spritesheet('player_dungeon3', 'assets/character_dungeon3.png', 28, 36);

    this.load.spritesheet('sword_dungeon', 'assets/sword_dungeon.png', 20, 34);
    this.load.image('tiles_dungeon', 'assets/tiles_dungeon.png');
    this.load.image('collectable_dungeon', 'assets/chest.png');
    this.load.image('key_dungeon', 'assets/dungeon_key.png');
    this.load.image('door_dungeon', 'assets/keyhole_block.png');
    this.load.spritesheet('enemy_dungeon1', 'assets/enemy_dungeon1.png', 28, 36);

    //RPG state sprites
    this.load.spritesheet('player_rpg', 'assets/character_rpg.png', 27, 32);
    this.load.image('tiles_rpg', 'assets/tiles_rpg.png');
    this.load.image('collectable_rpg', 'assets/chest.png');
    this.load.image('npc1_rpg', 'assets/npc_01.png');
    this.load.image('npc2_rpg', 'assets/npc_02.png');
    this.load.image('npc3_rpg', 'assets/npc_03.png');
    this.load.image('npc4_rpg', 'assets/npc_04.png');
    this.load.image('npc5_rpg', 'assets/npc_05.png');
    this.load.image('npc6_rpg', 'assets/npc_06.png');
    this.load.image('npc7_rpg', 'assets/npc_07.png');
    this.load.image('fragile_tree', 'assets/cuttable_tree.png');
    this.load.spritesheet('enemy_rpg', 'assets/enemy_rpg.png', 32, 34);


    //Preload music
    pixelEvolution._music = Phaser.Sound;
    this.load.audio('music', ['assets/sounds.mp3'], false);
};

function create()
{
    //Add all different states/phases
    this.state.add('menu', mainMenu);
    this.state.add('pixel', pixelPhase);
    this.state.add('pacman', pacmanPhase);
    this.state.add('dungeon', dungeonPhase);
    this.state.add('rpg', rpgPhase);
    this.state.add('evolution', evolution);


    pixelEvolution._music = this.add.audio('music');
    pixelEvolution._music.override = true;

    pixelEvolution._music.addMarker('bg1', 0.028, 10.216, 1, true);
    pixelEvolution._music.addMarker('bg2', 10.244, 10.214, 1, true);
    pixelEvolution._music.addMarker('bg3', 20.458, 10.238, 1, true);
    pixelEvolution._music.addMarker('bg4', 30.696, 10.188, 1, true);
    pixelEvolution._music.addMarker('chat', 40.884, 0.314, 1, false);
    pixelEvolution._music.addMarker('itempickup', 41.198, 0.494, 1, false);
    pixelEvolution._music.addMarker('8bbg1', 41.629, 7.696, 1, true);

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
        case 10: transitions.to('rpg');
                console.log("level10");
                ran = false;
                break;
        case 11: transitions.to('rpg');
                console.log("level11");
                ran = false;
                break;
        case 12: console.log("done");
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
var pixelEvolution = new PixelEvolution(800, 608, Phaser.CANVAS, 'game', {
    preload: preload,
    create: create
}, false, true);
//        NOTE: To use Phaser.AUTO instead of Phaser.CANVAS, you have to run a local server.


// DEBUG: links to change between states/phases manually
$('#evolutionLink').click(function(){ transitions.to('evolution'); });
$('#menuLink').click(function(){    pixelEvolution._level = 0; transitions.to('menu'); });
$('#pixelLink').click(function(){   pixelEvolution._level = 0; transitions.to('pixel'); });
$('#pacmanLink').click(function(){  pixelEvolution._level = 3; transitions.to('pacman'); });
$('#dungeonLink').click(function(){ pixelEvolution._level = 6; transitions.to('dungeon'); });
$('#rpgLink').click(function(){     pixelEvolution._level = 9; transitions.to('rpg'); });
