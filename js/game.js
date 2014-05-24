var freeTiles = [];
var pause = false;

function generateLevel() {
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
        	freeTiles.push(tile);
        }

        //channel info to debug so the preview can be rendered.
	    display.DEBUG(x,y,value);
    }

	/* generate x generations */
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

	console.log(level);
	return level;
}


var Keys = Phaser.Keyboard;
var speed = 3;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
}, /*transparent*/ false, /*antialiasing*/ false);

function preload() {
    game.load.image('chest', 'assets/chest.png');
    game.load.spritesheet('player', 'assets/character.png', 79, 95);

    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
    game.load.tilemap('level', null, generateLevel(), Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/tiles_32.png');
}

var layer;
var map;
var p;
var cursors;
var chests = [];

function create() {
	//game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Modify the world and camera bounds
    //game.world.setBounds(-2000, -2000, 4000, 4000);

    //8Bit mode
    game.stage.smoothed = false;
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    //create tiled map
    map = game.add.tilemap('level', 32, 32);
    map.addTilesetImage('tiles');
    map.setCollisionBetween(1,200);


    layer = map.createLayer(0);
    layer.resizeWorld(); //??

    //spawn chests
    for (var i=0; i<6; i++){
		var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
		var randomFreeTile = freeTiles.splice(index, 1)[0];
		var chest = game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'chest');
		game.physics.enable(chest);
		chests.push(chest);
	}

    //Camera topdown and character
    var index = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
    var randomFreeTile = freeTiles.splice(index, 1)[0];

    p = game.add.sprite(randomFreeTile[0]*32, randomFreeTile[1]*32, 'player');
    //p.anchor.setTo(0.5, 0.5);
    p.scale.setTo(0.4, 0.4);
    game.physics.enable(p); // ??

    p.body.bounce = 0.2;
    p.body.collideWorldBounds = true;

    var animsSpeed = 8;
    p.animations.add('left', [8, 9], animsSpeed, true);
    p.animations.add('right', [3, 4], animsSpeed, true);
    p.animations.add('up', [5, 6, 5, 7], animsSpeed, true);
    p.animations.add('down', [0, 1, 0, 2], animsSpeed, true);

    game.camera.follow(p, Phaser.Camera.FOLLOW_TOPDOWN);

    cursors = game.input.keyboard.createCursorKeys();


    //for (var i = 0; i < 100; i++) {
    //    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    //}
}

var movespeed = 150;
var facing = "down";

function update() {
	if(!pause){
	    game.physics.arcade.collide(p, layer);

	    for(var i=0; i<chests.length;i++){
	    	var chest = chests[i];
	    	game.physics.arcade.collide(chest, p, collisionHandler, null, this);
		}

	    p.body.velocity.x = 0;
	    p.body.velocity.y = 0;

	    if (cursors.up.isDown)
	    {
	        p.body.velocity.y = -movespeed;
	        if (facing != 'up'){
	            p.animations.play('up');
	            facing = 'up';
	        }
	    }
	    else if (cursors.down.isDown)
	    {
	        p.body.velocity.y = movespeed;
	        if (facing != 'down'){
	            p.animations.play('down');
	            facing = 'down';
	        }
	    } else if (cursors.left.isDown)
	    {
	        p.body.velocity.x = -movespeed;

	        if (facing != 'left'){
	            p.animations.play('left');
	            facing = 'left';
	        }
	    }
	    else if (cursors.right.isDown)
	    {
	        p.body.velocity.x = movespeed;
	        if (facing != 'right'){
	            p.animations.play('right');
	            facing = 'right';
	        }
	    } else {
	    	if (facing != 'idle'){
	            p.animations.stop();

	            if (facing == 'left'){
	                p.frame = 8;
	            } else if (facing == 'right'){
	            	p.frame = 3;
	        	} else if (facing == 'up'){
	        		p.frame = 5;
	    		} else if (facing == 'down'){
	                p.frame = 0;
	            }

	            facing = 'idle';
	        }
	    }
	}

}

function collisionHandler(chest){
	pause = true;
	alert('hit!');
	chest.destroy();
	pause = false;
}



function render() {

    //game.debug.cameraInfo(game.camera, 32, 32).style.fontSize = 5;

}