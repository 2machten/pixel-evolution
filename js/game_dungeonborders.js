var startLocation;
var digger;

function generateLevel() {
	var w = 80, h = 60;
	digger = new ROT.Map.Uniform(w, h, {
		roomWidth: [5,10],
		roomHeight: [5,10],
		roomDugPercentage: 0.10
	});
	//map.randomize(0.52);

	var display;
	var terrainMap = [];

	var digCallback = function(x, y, value) {
		if(terrainMap[x] == null){
			terrainMap[x] = [];
		}

	    terrainMap[x][y] = value;

	    //channel info to debug so the preview can be rendered.
	    display.DEBUG(x,y,value);
    }

	display = new ROT.Display({width:w, height:h, fontSize:4}); 
	digger.create(digCallback.bind(this));

	var i = Math.floor(ROT.RNG.getUniform() * digger._rooms.length);
	startLocation = digger._rooms[i].getCenter();

	//show map in canvas
	document.body.appendChild(display.getContainer());

	var level = "";

	for (var i=0; i<terrainMap[0].length; i++) {
		for (var j=0; j<terrainMap.length; j++) {
			if (terrainMap[j][i] == "0"){
				terrainMap[j][i] = "1";
			} else if (terrainMap[j][i] == "1"){
				terrainMap[j][i] = "0";
			}
		}
	}

	//Remove single outliers
	/*for (var i=0; i<terrainMap[0].length; i++) {
		for (var j=0; j<terrainMap.length; j++) {
			var point = terrainMap[j][i]+"";

			try{
				if(terrainMap[j-1][i] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i+1] == 1){
					terrainMap[j][i] = "1";
				} else if(terrainMap[j-1][i] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i-1] == 1){
					terrainMap[j][i] = "1";
				} 

				if(terrainMap[j][i+1] == 1 && terrainMap[j][i-1] == 1 && terrainMap[j+1][i] == 1){
					terrainMap[j][i] = "1";
				} else if(terrainMap[j][i+1] == 1 && terrainMap[j][i-1] == 1 && terrainMap[j-1][i] == 1){ 
					terrainMap[j][i] = "1";
				} 
			} catch(e){}
		}
	}*/

	for (var i=0; i<terrainMap[0].length; i++) {
		for (var j=0; j<terrainMap.length; j++) {
			var point = terrainMap[j][i]+"";
			
			if(point=="0"){
				try{
					if(terrainMap[j-1][i+1] == 1 && terrainMap[j-1][i] == 1 && terrainMap[j][i+1] == 1){ //bottom left corner outward
						point = "66";
					} else if(terrainMap[j-1][i-1] == 1 && terrainMap[j-1][i] == 1 && terrainMap[j][i-1] == 1){ //top left corner outward
						point = "64";
					} else if(terrainMap[j+1][i+1] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i+1] == 1){ //bottom right corner outward
						point = "65";
					} else if(terrainMap[j+1][i-1] == 1 && terrainMap[j+1][i] == 1 && terrainMap[j][i-1] == 1){ //top right corner outward
						point = "63";
					} else if(terrainMap[j+1][i] == 1){ //right V
						point = "57";
					} else if(terrainMap[j-1][i] == 1){ //left V
						point = "59";
					} else if(terrainMap[j][i-1] == 1){ //bottom V
						point = "61";
					} else if(terrainMap[j][i+1] == 1){ //top V
						point = "55";
					} else if(terrainMap[j-1][i+1] == 1){ //bottom left corner
						point = "56";
					} else if(terrainMap[j-1][i-1] == 1){ //bottom right corner
						point = "62";
					} else if(terrainMap[j+1][i+1] == 1){ //top left corner
						point = "54";
					} else if(terrainMap[j+1][i-1] == 1){ //top right corner
						point = "60";
					} else {
						point = "25";
					}

				}catch(e){
					point = "25";
				}
			} else {
				point = "0";
			}			
			
			level += point + ",";
		}
		level += "\n";
	}

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
    game.load.image('mushroom', 'assets/melon.png');
    game.load.image('phaser', 'assets/melon.png');

    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
    game.load.tilemap('level', null, generateLevel(), Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/catastrophi_tiles_16.png');
}

var layer;
var map;
var p;
var cursors;

function create() {
	//game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Modify the world and camera bounds
    //game.world.setBounds(-2000, -2000, 4000, 4000);

    //8Bit mode
    game.stage.smoothed = false;
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    //create tiled map
    map = game.add.tilemap('level', 16, 16);
    map.addTilesetImage('tiles');
    map.setCollisionBetween(1,200);

    layer = map.createLayer(0);
    layer.resizeWorld(); //??

    //Camera topdown
    p = game.add.sprite(startLocation[0]*16, startLocation[1]*16, 'mushroom');
    p.anchor.setTo(0.5, 0.5);
    p.scale.setTo(0.5, 0.5);
    game.physics.enable(p); // ??

    p.body.bounce = 0.2;
    p.body.collideWorldBounds = true;


    game.camera.follow(p, Phaser.Camera.FOLLOW_TOPDOWN);

    cursors = game.input.keyboard.createCursorKeys();


    //for (var i = 0; i < 100; i++) {
    //    game.add.sprite(game.world.randomX, game.world.randomY, 'mushroom');
    //}
}

var movespeed = 150;

function update() {

    game.physics.arcade.collide(p, layer);

    p.body.velocity.x = 0;
    p.body.velocity.y = 0;

    if (cursors.up.isDown)
    {
        p.body.velocity.y = -movespeed;
    }
    else if (cursors.down.isDown)
    {
        p.body.velocity.y = movespeed;
    }

    if (cursors.left.isDown)
    {
        p.body.velocity.x = -movespeed;
    }
    else if (cursors.right.isDown)
    {
        p.body.velocity.x = movespeed;
    }

}



function render() {

    //game.debug.cameraInfo(game.camera, 32, 32).style.fontSize = 5;

}