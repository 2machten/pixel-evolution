/**
 * Player object, extends Phaser.Sprite
 */

 Player = function(game, scale, sprite, moveSpeed) {
    this._game = game;
    this._state = this._game.state.getCurrentState();

    //properties
    this.quests = [];
    this.hp = 3;
    this.damage = 1;
    this.facing = "";
    this.movespeed = moveSpeed;
    this.facing = "down";
    this._keys = 0;
    this._idleLeft;
    this._idleRight;
    this._idleUp;
    this._idleDown;
    this._sword = null;
    this._axeSkill = false;

    startPosition = this._state.getPlayerPosition();

    var halfWidth = this._state._map.tileWidth * 0.5;
    var halfHeight = this._state._map.tileHeight * 0.5;

    //create a new sprite and put it on that free spot
    Phaser.Sprite.call(this, this._game, startPosition[0]+halfWidth, startPosition[1]+halfHeight, sprite);

    this.scale.setTo(scale, scale);
    this.anchor.setTo(0.5, 0.5);

    //enable physics for collision detection and collide to the worlds edge
    this._game.physics.enable(this);
    this.body.collideWorldBounds = true;

    //Add animations for walking
    
    if(this._game._level > 5 && this._game._level < 9){
        var animsSpeed = 10;
        this.animations.add('right', [0,1,2,3], animsSpeed, true);
        this.animations.add('left', [4,5,6,7], animsSpeed, true);
        this.animations.add('up', [4,5,6,7], animsSpeed, true);
        this.animations.add('down', [0,1,2,3], animsSpeed, true);

        this._idleLeft = 7;
        this._idleRight = 3;
        this._idleUp = 7;
        this._idleDown = 3;
    } else {
        var animsSpeed = 8;
        this.animations.add('left', [8, 9], animsSpeed, true);
        this.animations.add('right', [3, 4], animsSpeed, true);
        this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
        this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

        this._idleLeft = 8;
        this._idleRight = 3;
        this._idleUp = 5;
        this._idleDown = 0;
    }

    //store cursors object for controlling the character
    this.cursors = this._game.input.keyboard.createCursorKeys();
    this.swordKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.axeKey = game.input.keyboard.addKey(Phaser.Keyboard.X);

    //make the camera follow the player
    this._game.camera.follow(this, Phaser.Camera.FOLLOW_TOPDOWN);

    this.ticks = 0;
    this._spacePressed = false;
};

//Extend the player object to be a Phaser.Sprite
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

//collisionhandler for items
Player.prototype.itemCollisionHandler = function(player, chest){
    //var currentMusic = this._game.music.currentMarker;

    //this._game.music.play('itempickup');
    var textElement = pixelEvolution.state.getCurrentState()._collectableText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";

    //Set new text off collectable ui
    textElement.setText(newText);
    chest.destroy();
    //this._game.music.play(currentMusic);
};

var timer;
Player.prototype.enemyCollisionHandler = function(enemy, player){
    //if pacman stage, restart immediately
    var state = pixelEvolution.state.current;
    if(state == "pacman") {
        transitions.to('pacman');
    }

    //Remove one visual heart container
    if(typeof pixelEvolution.state.getCurrentState()._hearts != "undefined"){
        pixelEvolution.state.getCurrentState()._hearts.getTop().destroy();
    }

    if(typeof timer == "undefined" || timer == null){
        timer = setInterval(
             (function(p) {  
                 return function() {  
                     if (p.tint == 0xff6868){
                        p.tint = 0xffffff;
                     } else{
                        p.tint = 0xff6868;
                     }
                 }
             })(player), 150); 

        var diffx = player.position.x - (enemy.position.x+16);
        var diffy = player.position.y - (enemy.position.y+16);

        player.position.x += 3*diffx;
        player.position.y += 3*diffy;
    }

    setTimeout((function(p) {  
                 return function() { 
                    clearInterval(timer); 
                    timer = null;
                    p.tint = 0xffffff;
                }
            })(player), 1500);

    //decrease player hp
    if(player.hp <= 0) {

        //WERK BITCH
        transitions.to(state);
    } else {
        player.hp--;
        console.log(player.hp);
    }
}

//collisionhandler for doors in the dungeon stage
Player.prototype.doorCollisionHandler = function(player, door){
    if(player._keys == 0){
        player._game.showMessage("The door is locked,\nif only I had a key!");
    } else {
        //"use" 1 key.
        player._keys--;
        var textElement = pixelEvolution.state.getCurrentState()._keyText;
        var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))-1 + "x";

        //Set new text off collectable ui
        textElement.setText(newText);

        //destroy or "open" the door.
        door.destroy();
    }
};

//collisionhandler for doors in the dungeon stage
Player.prototype.keyCollisionHandler = function(player, key){
    //var currentMusic = this._game.music.currentMarker;

    //this._game.music.play('itempickup');
    player._keys++;

    var textElement = pixelEvolution.state.getCurrentState()._keyText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";

    //Set new text off collectable ui
    textElement.setText(newText);
    key.destroy(); 
    //this._game.music.play(currentMusic);
};

//collisionhandler for npc in the rpg stage
Player.prototype.npcCollisionHandler = function(player, npc){

    npc.spawnOrangeBox(player, npc);
};

Player.prototype.updateCollision = function() {
    var tiles = this._state._layer;
    this._game.physics.arcade.collide(this, tiles);

    //collide with items
    try{
        var items = this._state._map._items;
        this._game.physics.arcade.collide(this, items, this.itemCollisionHandler, null, this.update);
    }catch(e){}

    //collide with enemies
    try{
        var enemies = this._state._enemy;
        this._game.physics.arcade.collide(this, enemies, this.enemyCollisionHandler, null, this.update);
    }catch(e){}

    //collide with doors
    try{
        var doors = this._state._map._doors;
        this._game.physics.arcade.collide(this, doors, this.doorCollisionHandler, null, this.update);
    }catch(e){}

    //collide with keys
    try{
        var keys = this._state._map._keys;
        this._game.physics.arcade.collide(this, keys, this.keyCollisionHandler, null, this.update);
    }catch(e){}

    //collide with npcs
    try{
        var npcs = this._state._map._npcs;
        //console.log(npcs);
        this._game.physics.arcade.collide(this, npcs, this.npcCollisionHandler, null, this.update);
    }catch(e){}
}

Player.prototype.updateMovement = function() {
    //Reset speed each update (else character keeps moving, velocity not position)
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    //walk up/down/left/right
    if (this.cursors.up.isDown){
        this.body.velocity.y = -this.movespeed;
        if (this.facing.indexOf('up') == -1){
            this.animations.play('up');
            this.facing = 'up';

        }
    }
    else if (this.cursors.down.isDown){
        this.body.velocity.y = this.movespeed;
        if (this.facing.indexOf('down') == -1){
            this.animations.play('down');
            this.facing = 'down';
        }
    } 
    else if (this.cursors.left.isDown){
        this.body.velocity.x = -this.movespeed;

        if (this.facing.indexOf('left') == -1){
            this.animations.play('left');
            this.facing = 'left';
        }
    } 
    else if (this.cursors.right.isDown){
        this.body.velocity.x = this.movespeed;
        if (this.facing.indexOf('right') == -1){
            this.animations.play('right');
            this.facing = 'right';
        }
    } else {
        //if cursor keys are released, make sure the player has the right sprite frame (no mid-walking sprites)
        if (this.facing.indexOf(' idle') == -1){

            this.animations.stop();

            if (this.facing.indexOf('left') != -1){
                this.frame = this._idleLeft;
            } else if (this.facing.indexOf('right') != -1){
                this.frame = this._idleRight;
            } else if (this.facing.indexOf('up') != -1){
                this.frame = this._idleUp;
            } else if (this.facing.indexOf('down') != -1){
                this.frame = this._idleDown;
            }

            this.facing += ' idle';
        } else {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
    }
}
/**
 * Automatically called by World.update
 */
 Player.prototype.update = function() {
    if(!this._game._pause){

        this.updateCollision();
        this.updateMovement();
        
        this.updateAxe();
        this.updateSword();
    }
    
};

Player.prototype.updateSword = function() {
    var tileWidth = this._state._map.tileWidth;
    this.ticks++;

    //sword action 
    if (this.swordKey.isDown && this._game._level > 5) {

        if((this._sword == null || !this._sword.alive) && this.ticks > 30){
            this.ticks = 0;
            this._sword = this._game.add.sprite(0,0,'sword_dungeon');
            this._sword.animations.add('slashRight', [0,1,2,3]);
            this._sword.animations.add('slashLeft', [4,5,6,7]);

            if(this.facing.indexOf('left') != -1 || this.facing.indexOf('up') != -1) this._sword.animations.play('slashLeft', 20, false, true);
            if(this.facing.indexOf('right') != -1 || this.facing.indexOf('down') != -1) this._sword.animations.play('slashRight', 20, false, true);
        }

        if(this.facing.indexOf('left') != -1 || this.facing.indexOf('up') != -1){
            this._sword.position.x = this.position.x - 30;
        } else {
            this._sword.position.x = this.position.x + 8;
        }
        
        this._sword.position.y = this.position.y - 15;


        var enemyArray = this._state._map._enemies.children;
        for(var i = 0; i < enemyArray.length; i++) {
            var diffx = (this.position.x - enemyArray[i].position.x);
            var diffy = (this.position.y - enemyArray[i].position.y);
            
            //console.log("player");console.log(this.position.x);console.log(this.position.y);
            //console.log("enemy");console.log(enemyArray[i].position.x);console.log(enemyArray[i].position.y);
            //console.log("differences"); console.log(diffx); console.log(diffy);
            //console.log("\n");
            if(this.facing.indexOf('down')!=-1 && diffy <= -0.5*tileWidth && diffy >= -1.5*tileWidth && diffx >= -0.5*tileWidth && diffx <= 1.5*tileWidth) {
                enemyArray[i].destroy();
                console.log("down");
            } else if(this.facing.indexOf('up')!=-1 && diffy <= 2.5*tileWidth && diffy >= 1.5*tileWidth && diffx >= -0.5*tileWidth && diffx <= 1.5*tileWidth) {
                enemyArray[i].destroy();
                console.log("up");
            } else if(this.facing.indexOf('left')!=-1 && diffy <= 1.5*tileWidth && diffy >= 0.5*tileWidth && diffx >= 1.5*tileWidth && diffx <= 2.5*tileWidth) {
                enemyArray[i].destroy();
                console.log("left");
            } else if(this.facing.indexOf('right')!=-1 && diffy <= 1.5*tileWidth && diffy >= -0.5*tileWidth && diffx >= -0.5*tileWidth && diffx <= -1.5*tileWidth) {
                enemyArray[i].destroy();
                console.log("right");
            }
        }
    }
}

Player.prototype.updateAxe = function() {
    if (this._axeSkill) {
        var tileWidth = this._state._map.tileWidth;
        var x = Math.floor(this.position.x/tileWidth);
        var y = Math.floor(this.position.y/tileWidth);
        var layer = this._state._map.getLayer();
        var leftTile = this._state._map.getTileLeft(layer, x, y);
        var rightTile = this._state._map.getTileRight(layer, x, y);
        var downTile = this._state._map.getTileBelow(layer, x, y);
        var upTile = this._state._map.getTileAbove(layer, x, y);

        // cut action
        if(this.axeKey.isDown && this._game._level > 8) {
            if(this.facing == 'left' && leftTile.index == 1) {
                console.log("left");
                this._state._map.putTile(0, x-1, y, layer);
            } else if(this.facing == 'right' && rightTile.index == 1) {
                console.log("right");
                this._state._map.putTile(0, x+1, y, layer);
            } else if(this.facing == 'up' && upTile.index == 1) {
                console.log("up");
                this._state._map.putTile(0, x, y-1, layer);
            } else if(this.facing == 'down' && downTile.index == 1) {
                console.log("down");
                this._state._map.putTile(0, x, y+1, layer);
            }
        }
    }
}
