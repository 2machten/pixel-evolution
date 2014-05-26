/**
 * WorldMap object, extends Phaser.Tilemap
 */

WorldMap = function(game, key, tileWidth, tileHeight, generateFunction) {
    this.game = game;

    this.level = generateFunction();
    this.game.load.tilemap('level', null, this.level, Phaser.Tilemap.CSV);

    Phaser.Tilemap.call(this, game, 'level', tileWidth, tileHeight);

    this.addTilesetImage('tiles');
    //make sure the player collides (cannot walk through) tiles of type 1 (tree)
    this.setCollisionBetween(1, 200);
}

WorldMap.prototype = Object.create(Phaser.Tilemap.prototype);
WorldMap.prototype.constructor = WorldMap;

/**
 * Automatically called by World.update
 */
WorldMap.prototype.update = function() {
    //updating
}