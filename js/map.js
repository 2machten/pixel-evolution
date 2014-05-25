/**
 * WorldMap object, wraps a Phaser.Tilemap object in this.map
 */

WorldMap = function(type) {
	this.freeTiles = [];

	switch(type){
		case "rpg":
			this.generateRPG();
			break;
		case "dungeon":
			this.generateDungeon();
			break;
	}

    //this method usually reads csv files, but also takes a string
    //as argument. generateLevel should produce a csv representation of
    //the map and it will render this.
	this.map = pixelEvolution._game.add.tilemap('level', 32, 32);
    
    this.map.addTilesetImage('tiles');
    //make sure the player collides (cannot walk through) tiles of type 1 (tree)
    this.map.setCollision(1);
}

/**
 * Automatically called by World.update
 */
WorldMap.prototype.update = function() {
	//updating
}

//map generation for RPG (cellular automata)
WorldMap.prototype.generateRPG = function()
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
    //DEBUG document.body.appendChild(display.getContainer());

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

    pixelEvolution._game.load.tilemap('level', null, level, Phaser.Tilemap.CSV);

    return level;
};

//map generation for dungeons
WorldMap.prototype.generateDungeon = function()
{
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
	//document.body.appendChild(display.getContainer());

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

	pixelEvolution._game.load.tilemap('level', null, level, Phaser.Tilemap.CSV);

	return level;
}
