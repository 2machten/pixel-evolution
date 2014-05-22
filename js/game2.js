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

PixelEvolution.prototype.blaat = function()
{
    console.log('hai');
    //var w = 80, h = 60;
    //var map = new ROT.Map.Cellular(w, h, {
        //born: [5,6,7,8],
        //survive: [4,5,6,7,8]
    //});
    //map.randomize(0.52);

    //var display;
    //var digCallback = function(x, y, value) {
        //if (value) { 
            //var tile = [x, y];
            //this.freeTiles.push(tile);
        //}

        ////channel info to debug so the preview can be rendered.
        //display.DEBUG(x,y,value);
    //}

    //[> generate x generations <]
    //for (var i=0; i<10; i++) {
        //display = new ROT.Display({width:w, height:h, fontSize:4}); 
        //map.create(digCallback.bind(this));
    //}
    ////show map in canvas
    //document.body.appendChild(display.getContainer());

    //var level = "";

    //for (var i=0; i<map._map[0].length; i++) {
        //for (var j=0; j<map._map.length; j++) {
            //var point = map._map[j][i]+"";

            //if(point=="0"){
                //point = "1";
            //} else {
                //point = "0";
            //}		

            //level += point + ",";
        //}
        //level += "\n";
    //}
    //return level;
};

// game initialization
PixelEvolution.prototype.init = function()
{
    this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
        preload: this.preload,
        create: this.create,
        update: this.update,
        render: this.render
    }, /*transparent*/ false, /*antialiasing*/ false);
};

PixelEvolution.prototype.preload = function()
{
    this.game.load.image('chest', 'assets/chest.png');
    this.game.load.spritesheet('player', 'assets/character.png', 79, 95);

    console.log(this);
    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
    this.game.load.tilemap('level', null, this.generator(), Phaser.Tilemap.CSV);
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
		var index = Math.floor(ROT.RNG.getUniform() * this.freeTiles.length);
		var randomFreeTile = this.freeTiles.splice(index, 1)[0];
		var chest = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
		this.game.physics.enable(chest);
		this.chests.push(chest);
	}

    //Camera topdown and character
    var index = Math.floor(ROT.RNG.getUniform() * this.freeTiles.length);
    var randomFreeTile = this.freeTiles.splice(index, 1)[0];

    this.p = this.game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'player');
    //this.p.anchor.setTo(0.5, 0.5);
    this.p.scale.setTo(0.4, 0.4);
    this.game.physics.enable(p); // ??

    this.p.body.bounce = 0.2;
    this.p.body.collideWorldBounds = true;

    var animsSpeed = 8;
    this.p.animations.add('left', [8, 9], animsSpeed, true);
    this.p.animations.add('right', [3, 4], animsSpeed, true);
    this.p.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    this.p.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

    this.game.camera.follow(this.p, Phaser.Camera.FOLLOW_TOPDOWN);

    this.cursors = this.game.input.keyboard.createCursorKeys();


    //for (var i = 0; i < 100; i++) {
    //    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    //}
};

PixelEvolution.prototype.update = function() {
	if(!this.pause){
	    this.game.physics.arcade.collide(this.p, this.layer);

	    for(var i=0; i<this.chests.length;i++){
	    	var chest = this.chests[i];
	    	this.game.physics.arcade.collide(this.chest, this.p, this.collisionHandler, null, this.update());
		}

	    this.p.body.velocity.x = 0;
	    this.p.body.velocity.y = 0;

	    if (this.cursors.up.isDown)
	    {
	        this.p.body.velocity.y = -movespeed;
	        if (this.facing != 'up'){
	            this.p.animations.play('up');
	            this.facing = 'up';

	        }
	    }
	    else if (this.cursors.down.isDown)
	    {
	        this.p.body.velocity.y = movespeed;
	        if (this.facing != 'down'){
	            this.p.animations.play('down');
	            this.facing = 'down';
	        }
	    } else if (this.cursors.left.isDown)
	    {
	        this.p.body.velocity.x = -movespeed;

	        if (this.facing != 'left'){
	            this.p.animations.play('left');
	            this.facing = 'left';
	        }
	    }
	    else if (this.cursors.right.isDown)
	    {
	        this.p.body.velocity.x = movespeed;
	        if (this.facing != 'right'){
	            this.p.animations.play('right');
	            this.facing = 'right';
	        }
	    } else {
	    	if (this.facing != 'idle'){
	            this.p.animations.stop();

	            if (this.facing == 'left'){
	                this.p.frame = 8;
	            } else if (this.facing == 'right'){
	            	this.p.frame = 3;
	        	} else if (this.facing == 'up'){
	        		this.p.frame = 5;
	    		} else if (this.facing == 'down'){
	                this.p.frame = 0;
	            }

	            this.facing = 'idle';
	        }
	    }
	}
};

PixelEvolution.prototype.collisionHandler = function()
{
	pause = true;
	alert('hit!');
	chest.destroy();
	pause = false;
};

PixelEvolution.prototype.render = function()
{
    //game.debug.cameraInfo(game.camera, 32, 32).style.fontSize = 5;
};

var game = new PixelEvolution();

console.log(game);

//initialization
game.init();
