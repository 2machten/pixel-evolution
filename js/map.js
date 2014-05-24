Map = function() {
    Phaser.Tilemap.call(pixelEvolution.game, 'level', 32, 32);
    this.addTilesetImage('tiles');
    this.setCollisionBetween(1,200);

    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld();
}


Map.prototype = Object.create(Phaser.Tilemap.prototype);
Map.prototype.constructor = Map;

/**
 * Automatically called by World.update
 */
Map.prototype.update = function() {
	//updating
}