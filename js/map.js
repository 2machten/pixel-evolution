/**
 * WorldMap object, extends Phaser.Tilemap
 */

WorldMap = function(game, key, tileSize, generateFunction, itemPositionFunction) {
    this._game = game;

    //generate the map first
    this.level = generateFunction();
    this._game.load.tilemap('level', null, this.level, Phaser.Tilemap.CSV);

    //then inherit the properties of a tilemap and use the generated level immediately
    Phaser.Tilemap.call(this, game, 'level', tileSize, tileSize);

    //automatically map tilemap (numbers) to images by their position
    this.addTilesetImage('tiles');
    
    //make sure the player collides (cannot walk through) all tiles except tile 0
    this.setCollisionByExclusion([0]);

    //create a group of items
    this._items = new Phaser.Group(this._game, null, "items", false);

    //spawn collectables in this group
    for (var i=0; i<6; i++){
        var spawnPosition = itemPositionFunction();
        var collectable = this._game.add.sprite(spawnPosition[0], spawnPosition[1], 'collectable');
        this._game.physics.enable(collectable);
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