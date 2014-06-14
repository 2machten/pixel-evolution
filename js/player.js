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
    } else {
        var animsSpeed = 8;
        this.animations.add('left', [8, 9], animsSpeed, true);
        this.animations.add('right', [3, 4], animsSpeed, true);
        this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
        this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);
    }

    //store cursors object for controlling the character
    this.cursors = this._game.input.keyboard.createCursorKeys();
    this.swordKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);

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
    var textElement = pixelEvolution.state.getCurrentState()._collectableText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";

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
             })(player), 200); 

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
    player._keys++;

    var textElement = pixelEvolution.state.getCurrentState()._keyText;
    var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";

    //Set new text off collectable ui
    textElement.setText(newText);
    key.destroy(); 
};

//collisionhandler for npc in the rpg stage
Player.prototype.npcCollisionHandler = function(player, npc){
    console.log(npc);
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
    if (this.cursors.up.isDown)
    {
        this.body.velocity.y = -this.movespeed;
        if (this.facing != 'up'){
            this.animations.play('up');
            this.facing = 'up';

        }
    }
    else if (this.cursors.down.isDown)
    {
        this.body.velocity.y = this.movespeed;
        if (this.facing != 'down'){
            this.animations.play('down');
            this.facing = 'down';
        }
    } else if (this.cursors.left.isDown)
    {
        this.body.velocity.x = -this.movespeed;

        if (this.facing != 'left'){
            this.animations.play('left');
            this.facing = 'left';
        }
    }
    else if (this.cursors.right.isDown)
    {
        this.body.velocity.x = this.movespeed;
        if (this.facing != 'right'){
            this.animations.play('right');
            this.facing = 'right';
        }
    } else {
        //if cursor keys are released, make sure the player has the right sprite frame (no mid-walking sprites)
        if (this.facing != 'idle'){
            this.animations.stop();

            if (this.facing == 'left'){
                this.frame = 8;
            } else if (this.facing == 'right'){
                this.frame = 3;
            } else if (this.facing == 'up'){
                this.frame = 5;
            } else if (this.facing == 'down'){
                this.frame = 0;
            }

            this.facing = 'idle';
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

    //sword action 
    if (this.swordKey.isDown && this._game._level > 5) {
        var diffx = (this.position.x - this._state._map._enemies.position.x);
        var diffy = (this.position.y - this._state._map._enemies.position.y);
        if(this.facing == 'down' && ((diffy < -0.5*tileWidth && diffy > -2.5*tileWidth && diffx > 0 && diffx < tileWidth) || 
                (diffy < -0.5*tileWidth && diffy > -1.5*tileWidth && diffx > -0.5*tileWidth && diffx < 1.5*tileWidth))) {
            this._state._enemies[i].destroy();
        } else if(this.facing == 'up' && ((diffy < 3.5*tileWidth && diffy > 1.5*tileWidth && diffx > 0 && diffx < tileWidth) || 
                (diffy < 2.5*tileWidth && diffy > 1.5*tileWidth && diffx > -0.5*tileWidth && diffx < 1.5*tileWidth))) {
            this._state._enemies[i].destroy();
        } else if(this.facing == 'left' && ((diffy < tileWidth && diffy > 0 && diffx > 1.5*tileWidth && diffx < 2.5*tileWidth) || 
                (diffy < 1.5*tileWidth && diffy > -0.5*tileWidth && diffx > 1.5*tileWidth && diffx < 2*tileWidth))) {
            this._state._enemies[i].destroy();
        } else if(this.facing == 'right' && ((diffy < 3.5*tileWidth && diffy > 1.5*tileWidth && diffx > 0 && diffx < tileWidth) || 
                (diffy < 2.5*tileWidth && diffy > 1.5*tileWidth && diffx > -0.5*tileWidth && diffx < 1.5*tileWidth))) {
            this._state._enemies[i].destroy();
        }
    }
}

Player.prototype.updateAxe = function() {
    // cut action
    var keyboard = this._game.input.keyboard;
    if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        if (!this._spacePressed) {
            // do action!
            this._spacePressed = true;

            // TODO: show axe swinging animation

            // TODO: kill the tree(s)
        }
    } else if (this._spacePressed) {
        this._spacePressed = false;
    }
}
