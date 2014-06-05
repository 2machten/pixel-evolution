/**
 * Enemy object, extends Phaser.Sprite
 */
var ticks = 0;

 var Enemy = function(game, scale, sprite, positionFunction) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    //properties
    this.hp = 1;
    this.facing = "";
    this.movespeed = 70;
    this.facing = "down";

    startPosition = state.getEnemyPosition();

    //create a new sprite and put it on that free spot
    Phaser.Sprite.call(this, this._game, startPosition[0], startPosition[1], sprite);

    this.scale.setTo(scale, scale);

    //enable physics for collision detection and collide to the worlds edge
    this._game.physics.enable(this);
    this.body.collideWorldBounds = true;

    //Add animations for walking
    var animsSpeed = 8;
    this.animations.add('left', [4, 5], animsSpeed, true);
    this.animations.add('right', [6, 7], animsSpeed, true);
    this.animations.add('up', [0, 1], animsSpeed, true);
    this.animations.add('down', [2, 3], animsSpeed, true);

};

//Extend the player object to be a Phaser.Sprite
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
console.log("Created enemy");

/**
 * Automatically called by World.update
 */
Enemy.prototype.update = function() {

    try {
    var tiles = this._game.state.getCurrentState()._layer;
    this._game.physics.arcade.collide(this, tiles);
    } catch (e) {

    }

    ticks++;

    if(ticks > 50) {
        ticks = 0;
        var direction = Math.ceil(Math.random() * 4);
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        //down
        if(direction == 1) {
            this.body.velocity.y = this.movespeed;
            if (this.facing != 'down'){
                this.animations.play('down');
                this.facing = 'down';
            }
        }
        //up
        else if(direction == 2) {
            this.body.velocity.y = -this.movespeed;
            if (this.facing != 'up'){
                this.animations.play('up');
                this.facing = 'up';
            }
        }
        //left
         else if(direction == 3) {
            this.body.velocity.x = -this.movespeed;
            if (this.facing != 'left'){
                this.animations.play('left');
                this.facing = 'left';
            }
        }
        //right
        else if(direction == 4) {
            this.body.velocity.x = this.movespeed;
            if (this.facing != 'right'){
                this.animations.play('right');
                this.facing = 'right';
            }
        }
    }

};
