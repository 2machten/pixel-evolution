/**
 * Enemy object, extends Phaser.Sprite
 */

 Enemy = function(game, scale, sprite, positionFunction) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    //properties
    this.hp = 1;
    this.facing = "";
    this.movespeed = 150;
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
    this.enemy.animations.add('left', [8, 9], animsSpeed, true);
    this.enemy.animations.add('right', [3, 4], animsSpeed, true);
    this.enemy.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.enemy.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

};

//Extend the player object to be a Phaser.Sprite
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
console.log("Created enemy");

/**
 * Automatically called by World.update
 */
 Enemy.prototype.update = function() {
    game.world.forEach(function(enemy) 
        {
            var direction = Math.floor(Math.random() * 4);
            
            if (direction == 1) 
            {   // Move north
                enemy.sprite.y -= SPEED;
            } 
            else if (direction == 2) 
            {   // Move east
                enemy.sprite.x += SPEED;
            }
            else if (direction == 3) 
            {   // Move south
                enemy.sprite.y += SPEED;
            }
            else if (direction == 4) 
            {   // Move west
                enemy.sprite.x -= SPEED;
            }
                            
        });
};
