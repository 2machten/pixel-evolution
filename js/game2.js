/**
 * Main game object.
 */
function PixelEvolution()
{
    // game variables
    this.freeTiles = [];
    this.pause = false;

    // init
    this.Keys = Phaser.keyboard;
    this.speed = 3;

    // create
    this.chests = [];

    // update
    this.movespeed = 150;
    this.facing = "down";
}

PixelEvolution.prototype.generator = function()
{
    var w = 80, h = 60;
    var map = new ROT.Map.Cellular(w, h, {
        born: [5,6,7,8],
        survive: [4,5,6,7,8]
    });
    map.randomize(0.52);

    var display;
    var digCallback = function(x, y, value) {
        if (value) { 
            var tile = [x, y];
            this.freeTiles.push(tile);
        }

        //channel info to debug so the preview can be rendered.
        display.DEBUG(x,y,value);
    }

    //[> generate x generations <]
    for (var i=0; i<10; i++) {
        display = new ROT.Display({width:w, height:h, fontSize:4}); 
        map.create(digCallback.bind(this));
    }
    //show map in canvas
    document.body.appendChild(display.getContainer());

    var level = "";

    for (var i=0; i<map._map[0].length; i++) {
        for (var j=0; j<map._map.length; j++) {
            var point = map._map[j][i]+"";

            if(point=="0"){
                point = "1";
            } else {
                point = "0";
            }

            level += point + ",";
        }
        level += "\n";
    }
    return level;
};

// game initialization
PixelEvolution.prototype.init = function()
{
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render,
        evo: this
    }, /*transparent*/ false, /*antialiasing*/ false);
};

PixelEvolution.prototype.preload = function()
{
    this.game.load.image('chest', 'assets/chest.png');
    this.game.load.spritesheet('player', 'assets/character.png', 79, 95);

    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
    this.game.load.tilemap('level', null, this.evo.generator(), Phaser.Tilemap.CSV);
    this.game.load.image('tiles', 'assets/tiles_32.png');
};

PixelEvolution.prototype.create = function() {
	//game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Modify the world and camera bounds
    //game.world.setBounds(-2000, -2000, 4000, 4000);

    //8Bit mode
    this.game.stage.smoothed = false;
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    //create tiled map
    this.map = this.game.add.tilemap('level', 32, 32);
    this.map.addTilesetImage('tiles');
    this.map.setCollisionBetween(1,200);


    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld(); //??

    //spawn chests
    for (var i=0; i<6; i++){
		var index = Math.floor(ROT.RNG.getUniform() * this.evo.freeTiles.length);
		var randomFreeTile = this.evo.freeTiles.splice(index, 1)[0];
		var chest = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
		this.game.physics.enable(chest);
		this.evo.chests.push(chest);
	}

    //Camera topdown and character
    var index = Math.floor(ROT.RNG.getUniform() * this.evo.freeTiles.length);
    var randomFreeTile = this.evo.freeTiles.splice(index, 1)[0];

    this.evo.p = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'player');
    //this.p.anchor.setTo(0.5, 0.5);
    this.evo.p.scale.setTo(0.4, 0.4);
    this.game.physics.enable(this.evo.p); // ??

    this.evo.p.body.bounce = 0.2;
    this.evo.p.body.collideWorldBounds = true;

    var animsSpeed = 8;
    this.evo.p.animations.add('left', [8, 9], animsSpeed, true);
    this.evo.p.animations.add('right', [3, 4], animsSpeed, true);
    this.evo.p.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.evo.p.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

    this.game.camera.follow(this.evo.p, Phaser.Camera.FOLLOW_TOPDOWN);

    this.cursors = this.game.input.keyboard.createCursorKeys();


    //for (var i = 0; i < 100; i++) {
    //    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    //}
};

PixelEvolution.prototype.update = function() {
	if(!this.evo.pause){
	    this.game.physics.arcade.collide(this.evo.p, this.evo.layer);

	    for(var i=0; i<this.evo.chests.length;i++){
	    	var chest = this.evo.chests[i];
	    	this.game.physics.arcade.collide(chest, this.evo.p, this.evo.collisionHandler, null, this.update);
		}

	    this.evo.p.body.velocity.x = 0;
	    this.evo.p.body.velocity.y = 0;

	    if (this.cursors.up.isDown)
	    {
	        this.evo.p.body.velocity.y = -this.evo.movespeed;
	        if (this.facing != 'up'){
	            this.evo.p.animations.play('up');
	            this.facing = 'up';

	        }
	    }
	    else if (this.cursors.down.isDown)
	    {
	        this.evo.p.body.velocity.y = this.evo.movespeed;
	        if (this.facing != 'down'){
	            this.evo.p.animations.play('down');
	            this.facing = 'down';
	        }
	    } else if (this.cursors.left.isDown)
	    {
	        this.evo.p.body.velocity.x = -this.evo.movespeed;

	        if (this.facing != 'left'){
	            this.evo.p.animations.play('left');
	            this.facing = 'left';
	        }
	    }
	    else if (this.cursors.right.isDown)
	    {
	        this.evo.p.body.velocity.x = this.evo.movespeed;
	        if (this.facing != 'right'){
	            this.evo.p.animations.play('right');
	            this.facing = 'right';
	        }
	    } else {
	    	if (this.facing != 'idle'){
	            this.evo.p.animations.stop();

	            if (this.facing == 'left'){
	                this.evo.p.frame = 8;
	            } else if (this.facing == 'right'){
	            	this.evo.p.frame = 3;
	        	} else if (this.facing == 'up'){
	        		this.evo.p.frame = 5;
	    		} else if (this.facing == 'down'){
	                this.evo.p.frame = 0;
	            }

	            this.facing = 'idle';
	        }
	    }
	}
};

PixelEvolution.prototype.collisionHandler = function(chest)
{
	this.pause = true;
	alert('hit!');
	chest.destroy();
	this.pause = false;
};

PixelEvolution.prototype.render = function()
{
    //game.debug.cameraInfo(game.camera, 32, 32).style.fontSize = 5;
};

var game = new PixelEvolution();

console.log(game);

//initialization
game.init();
