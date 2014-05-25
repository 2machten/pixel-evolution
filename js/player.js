/**
 * Player object, extends Phaser.Sprite
 */

Player = function() {
	//properties
	this.quests = [];
	this.hp = 1;
	this.damage = 1;
	this.facing = "";
	this.movespeed = 150;
    this.facing = "down";

	//find a free spot on the map
	var index = Math.floor(ROT.RNG.getUniform() * pixelEvolution.worldMap.freeTiles.length);
    var randomFreeTile = pixelEvolution.worldMap.freeTiles.splice(index, 1)[0];

    //create a new sprite and put it on that free spot
    Phaser.Sprite.call(this, pixelEvolution.game, randomFreeTile[0]*32, randomFreeTile[1]*32 - 6, 'player');

	this.scale.setTo(0.4, 0.4);

	//enable physics for collision detection and collide to the worlds edge
	pixelEvolution.game.physics.enable(this);
	this.body.collideWorldBounds = true;
	
	//Add animations for walking
	var animsSpeed = 8;
    this.animations.add('left', [8, 9], animsSpeed, true);
    this.animations.add('right', [3, 4], animsSpeed, true);
    this.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

    //store cursors object for controlling the character
    this.cursors = pixelEvolution.game.input.keyboard.createCursorKeys();

    //make the camera follow the player
    pixelEvolution.game.camera.follow(this, Phaser.Camera.FOLLOW_TOPDOWN);
};

//Extend the player object to be a Phaser.Sprite
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

//collisionhandler for chests (only, currently)
Player.prototype.collisionHandler = function(chest)
{
	this.pause = true;
	alert('hit!');
	chest.destroy();
	this.pause = false;
};

/**
 * Automatically called by World.update
 */
Player.prototype.update = function() {
	if(!pixelEvolution.pause){
	    pixelEvolution.game.physics.arcade.collide(this, pixelEvolution.layer);

	    for(var i=0; i<pixelEvolution.chests.length;i++){
	    	var chest = pixelEvolution.chests[i];
	    	this.game.physics.arcade.collide(chest, this, this.collisionHandler, null, this.update);
		}

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
	}
};