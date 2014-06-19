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
    this.movespeed = moveSpeed * 10;
    this._keys = 0;
    this._idleLeft;
    this._idleRight;
    this._idleUp;
    this._idleDown;
    this._sword = null;
    this._axeSkill = false;
    this._tree = undefined;
    this._chests = 0; // only used in RPG

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
        //dungeonstage
        var animsSpeed = 10;
        this.animations.add('right', [0,1,2,3], animsSpeed, true);
        this.animations.add('left', [4,5,6,7], animsSpeed, true);
        this.animations.add('up', [4,5,6,7], animsSpeed, true);
        this.animations.add('down', [0,1,2,3], animsSpeed, true);

        this._idleLeft = 7;
        this._idleRight = 3;
        this._idleUp = 7;
        this._idleDown = 3;

        this.frame = 3;
    } else if(this._game._level > 8){
        //rpgstage
        var animsSpeed = 8;
        var slashSpeed = 13;

        this.animations.add('left', [8, 9], animsSpeed, true);
        this.animations.add('right', [3, 4], animsSpeed, true);
        this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
        this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

        this.animations.add('slashRight', [13,14,15,3], slashSpeed, false);
        this.animations.add('slashLeft', [19,20,21,8], slashSpeed, false);
        this.animations.add('slashUp', [16,17,18,5], slashSpeed, false);
        this.animations.add('slashDown', [10,11,12,0], slashSpeed, false);

        this.animations.add('axeRight', [25,26,27,3], slashSpeed, false);
        this.animations.add('axeLeft', [31,32,33,8], slashSpeed, false);
        this.animations.add('axeUp', [28,29,30,5], slashSpeed, false);
        this.animations.add('axeDown', [22,23,24,0], slashSpeed, false);

        this._idleLeft = 8;
        this._idleRight = 3;
        this._idleUp = 5;
        this._idleDown = 0;

        this.frame = 0;
    } else {
        //pacmanstage
        var animsSpeed = 6;

        this.animations.add('left', [8, 9], animsSpeed, true);
        this.animations.add('right', [3, 4], animsSpeed, true);
        this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
        this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

        this.frame = 3;
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
    player._game._sfx.play('itempickup');
    var textElement = pixelEvolution.state.getCurrentState()._collectableText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";
    player._chests++;

    //Set new text off collectable ui
    textElement.setText(newText);
    chest.destroy();
};

var timer;
Player.prototype.enemyCollisionHandler = function(enemy, player){
    //if pacman stage, restart immediately
    var state = pixelEvolution.state.current;
    if(state == "pacman") {
        transitions.to('pacman');
    } else {
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
        if(player.hp == 1) {
            transitions.to(state);
        } else {
            player.hp--;
            console.log(player.hp);
        }
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
    player._game._sfx.play('itempickup');
    player._keys++;

    var textElement = pixelEvolution.state.getCurrentState()._keyText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";

    //Set new text off collectable ui
    textElement.setText(newText);
    key.destroy(); 
};

//collisionhandler for npc in the rpg stage
Player.prototype.npcCollisionHandler = function(player, npc){

    npc.spawnOrangeBox(player, npc);
};

// tree collision handler
Player.prototype.treeCollisionHandler = function(player, tree) {
    if (player._axeSkill) {
        //player._game.showMessage("Maybe I should use my aXe?");
    } else {
        player._game.showMessage("If only I had an axe?");
    }
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

    // collide with fragile trees
    if (this._tree != undefined) {
        try{
            this._game.physics.arcade.collide(this, this._tree, this.treeCollisionHandler, null, this.update);
        }catch(e){}
    }
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
    if (this.swordKey.isDown && this._game._level > 6) {

        //handle sword animation in dungeon phase
        if(this._game._level < 9){
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
        } 
        //handle sword animation for rpg stage
        else {
            if(this.facing.indexOf('left') != -1){
                this.animations.play('slashLeft');
            } else if(this.facing.indexOf('right') != -1){
                this.animations.play('slashRight');
            } else if(this.facing.indexOf('up') != -1){
                this.animations.play('slashUp');
            } else if(this.facing.indexOf('down') != -1){
                this.animations.play('slashDown');
            }
        }


        var enemyArray = this._state._map._enemies.children;
        for(var i = 0; i < enemyArray.length; i++) {
            var tileWidth = this._state._map.tileWidth;
            var x = Math.floor(this.position.x/tileWidth);
            var y = Math.floor(this.position.y/tileWidth);
            var treex = Math.floor(enemyArray[i].position.x/tileWidth);
            var treey = Math.floor(enemyArray[i].position.y/tileWidth);

            if(this.facing.indexOf('left') != -1 && treex < x && treex >= x - 2 && treey <= y + 1 && treey >= y - 1) {
                console.log('left destroy');
                enemyArray[i].destroy();
            } else if(this.facing.indexOf('right') != -1 && treex > x && treex <= x + 2 && treey <= y + 1 && treey >= y - 1) {
                console.log('right destroy');
                enemyArray[i].destroy();
            } else if(this.facing.indexOf('up') != -1 && treey < y && treey >= y - 2 && treex <= x + 1 && treex >= x - 1) {
                console.log('up destroy');
                enemyArray[i].destroy();
            } else if(this.facing.indexOf('down') != -1 && treey > y && treey <= y + 2 && treex <= x + 1 && treex >= x - 1) {
                console.log('down destroy');
                enemyArray[i].destroy();
            }
        }
    }
}

Player.prototype.updateAxe = function() {
    if (this._axeSkill) {
        // cut action
        if(this.axeKey.isDown && this._game._level > 8) {
            if(this._game._level > 8){
            //handle axe animation for rpg stage
                if(this.facing.indexOf('left') != -1){
                    this.animations.play('axeLeft');
                } else if(this.facing.indexOf('right') != -1){
                    this.animations.play('axeRight');
                } else if(this.facing.indexOf('up') != -1){
                    this.animations.play('axeUp');
                } else if(this.facing.indexOf('down') != -1){
                    this.animations.play('axeDown');
                }
            }

            var tileWidth = this._state._map.tileWidth;
            var x = Math.floor(this.position.x/tileWidth);
            var y = Math.floor(this.position.y/tileWidth);
            var treex = Math.floor(this._tree.position.x/tileWidth);
            var treey = Math.floor(this._tree.position.y/tileWidth);
            console.log([x, y]);
            console.log([treex, treey]);
            console.log(this.facing);

            if(this.facing.indexOf('left') != -1 && treex < x && treex >= x - 2 && treey <= y + 1 && treey >= y - 1) {
                console.log('left destroy');
                this._tree.destroy();
            } else if(this.facing.indexOf('right') != -1 && treex > x && treex <= x + 2 && treey <= y + 1 && treey >= y - 1) {
                console.log('right destroy');
                this._tree.destroy();
            } else if(this.facing.indexOf('up') != -1 && treey < y && treey >= y - 2 && treex <= x + 1 && treex >= x - 1) {
                console.log('up destroy');
                this._tree.destroy();
            } else if(this.facing.indexOf('down') != -1 && treey > y && treey <= y + 2 && treex <= x + 1 && treex >= x - 1) {
                console.log('down destroy');
                this._tree.destroy();
            }
        }
    }
}
