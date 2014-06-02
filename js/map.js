/**
 * WorldMap object, extends Phaser.Tilemap
 */

WorldMap = function(game, key, tileSprite, tileSize, generateFunction, collectableSprite, itemPositionFunction) {
    this._game = game;
    var state = this._game.state.getCurrentState();
    
    this.level = state.generate();
    this._game.load.tilemap('level', null, this.level, Phaser.Tilemap.CSV);

    Phaser.Tilemap.call(this, game, 'level', tileSize, tileSize);

    //automatically map tilemap (numbers) to images by their position
    this.addTilesetImage(tileSprite);
    
    //make sure the player collides (cannot walk through) all tiles except tile 0
    this.setCollisionByExclusion([0]);

    //create a group of doors
    if(this._game._level == 6){
        this._doors = new Phaser.Group(this._game, null, "doors", false);
        //spawn collectables in this group
        for (var i=0; i<3; i++){
            var spawnPosition = state.getDoorPosition();
            var door = this._game.add.sprite(spawnPosition[0], spawnPosition[1], 'door_dungeon');
            this._game.physics.enable(door);
            door.body.immovable = true;
            this._doors.add(door);
        }

        //create a group of items
        this._keys = new Phaser.Group(this._game, null, "keys", false);
        //spawn collectables in this group
        for (var i=0; i<3; i++){
            var spawnPosition = state.getKeyPosition();
            var key = this._game.add.sprite(spawnPosition[0], spawnPosition[1], 'key_dungeon');
            this._game.physics.enable(key);
            key.body.immovable = true;
            this._keys.add(key);
        }
    }

    //create a group of items
    this._items = new Phaser.Group(this._game, null, "items", false);
    //spawn collectables in this group
    for (var i=0; i<6; i++){
        var spawnPosition = state.getItemPosition();
        var collectable = this._game.add.sprite(spawnPosition[0], spawnPosition[1], collectableSprite);
        this._game.physics.enable(collectable);
        collectable.body.immovable = true;
        this._items.add(collectable);
    }
}

WorldMap.prototype = Object.create(Phaser.Tilemap.prototype);
WorldMap.prototype.constructor = WorldMap;

/**
 * Automatically called by World.update
 */
WorldMap.prototype.update = function() {
    //updating
}