/**
 * Player object, extends Phaser.Sprite
 */

 Player = function(game, scale, sprite, positionFunction, moveSpeed) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    //properties
    this.quests = [];
    this.hp = 3;
    this.damage = 1;
    this.facing = "";
    this.movespeed = 150;
    this.facing = "down";
    this._keys = 0;

    startPosition = state.getPlayerPosition();

    //create a new sprite and put it on that free spot
    Phaser.Sprite.call(this, this._game, startPosition[0], startPosition[1], sprite);

    this.scale.setTo(scale, scale);

    //enable physics for collision detection and collide to the worlds edge
    this._game.physics.enable(this);
    this.body.collideWorldBounds = true;

    //Add animations for walking
    var animsSpeed = 8;
    this.animations.add('left', [8, 9], animsSpeed, true);
    this.animations.add('right', [3, 4], animsSpeed, true);
    this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

    //store cursors object for controlling the character
    this.cursors = this._game.input.keyboard.createCursorKeys();

    //make the camera follow the player
    this._game.camera.follow(this, Phaser.Camera.FOLLOW_TOPDOWN);

    this.ticks = 0;
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

Player.prototype.enemyCollisionHandler = function(player, enemy){
    player._game.showMessage("Autch!");
    if(typeof pixelEvolution.state.getCurrentState()._hearts != "undefined"){
        pixelEvolution.state.getCurrentState()._hearts.getTop().destroy();
    }
    alert('test');

    if(this.hp <= 0) {
        player._game.showMessage("You died. Kthxbai!")
    } else {
        this.hp--;
        console.log(this.hp);
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


/**
 * Automatically called by World.update
 */
 Player.prototype.update = function() {
    if(!this._game._pause){

        var tiles = this._game.state.getCurrentState()._layer;
        this._game.physics.arcade.collide(this, tiles);

        //collide with items
        try{
            var items = this._game.state.getCurrentState()._map._items;
            this._game.physics.arcade.collide(this, items, this.itemCollisionHandler, null, this.update);
        }catch(e){}

        //collide with enemies
        try{
            var enemies = this._game.state.getCurrentState()._enemy;
            this._game.physics.arcade.collide(this, enemies, this.enemyCollisionHandler, null, this.update);
        }catch(e){}

        //collide with doors
        try{
            var doors = this._game.state.getCurrentState()._map._doors;
            this._game.physics.arcade.collide(this, doors, this.doorCollisionHandler, null, this.update);
        }catch(e){}

        //collide with keys
        try{
            var keys = this._game.state.getCurrentState()._map._keys;
            this._game.physics.arcade.collide(this, keys, this.keyCollisionHandler, null, this.update);
        }catch(e){}

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
            }
        }
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
};
