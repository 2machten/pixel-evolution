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
    this.movespeed = 110;
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
    this.animations.add('left', [8, 9], animsSpeed, true);
    this.animations.add('right', [3, 4], animsSpeed, true);
    this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

};

//Extend the player object to be a Phaser.Sprite
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
console.log("Created enemy");

/**
 * Automatically called by World.update
 */
 Enemy.prototype.update = function() {
    var tiles = this._game.state.getCurrentState()._layer;
    this._game.physics.arcade.collide(this, tiles);

    ticks++;
    
    if(ticks > 50) {
        ticks = 0;
        var direction = Math.floor((Math.random() * 5));
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (direction == 1) 
        {   // Move north
            this.body.velocity.y = -this.movespeed;
        } 
        else if (direction == 2) 
        {   // Move south
            this.body.velocity.y = this.movespeed;
        }
        else if (direction == 3) 
        {   // Move east
            this.body.velocity.x = this.movespeed;
        }
        else if (direction == 4) 
        {   // Move west
            this.body.velocity.x = -this.movespeed;
        }
    }
};
