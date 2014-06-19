loader = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.ticks = 0;
    this._game.stage.smoothed = false;
}

//Extend the loader object to be a Phaser.State
loader.prototype = Object.create(Phaser.State.prototype);
loader.prototype.constructor = loader;


loader.prototype.preload = function(){
    this.loaderEmpty = this.add.sprite(this.camera.width/2 - (365/2), this.camera.height/2 - (49/2), 'loaderEmpty');
    this.preloadBar = this.add.sprite(this.camera.width/2  - (365/2), this.camera.height/2 - (49/2), 'loaderFull');

    this.load.setPreloadSprite(this.preloadBar);

    //general game sprites
    this.load.image('message_bg', 'assets/message_bg.png');
    this.load.spritesheet('heart', 'assets/heart.png', 8, 7);
    //this.load.text('font', 'http://fonts.googleapis.com/css?family=Press+Start+2P');
    this.load.image('space', 'assets/spaaaaaaace.png');
    
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
    this.load.image('collectable_pixel5', 'assets/black_pixel.png');
    this.load.image('collectable_pixel6', 'assets/black_pixel.png');
    this.load.image('collectable_pixel7', 'assets/black_pixel.png');

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
    this.load.spritesheet('player_rpg', 'assets/character_rpg_new.png', 40, 49);
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
    this.load.image('orange_box', 'assets/orange_box.png');


    //Preload music
    this.load.audio('music', ['assets/sounds.mp3'], false);
}

loader.prototype.create = function(){
    this._game.state.start('menu');
}

