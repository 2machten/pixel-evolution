
NPC = function(game, scale, sprite, positionFunction, startPosition) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    Phaser.Sprite.call(this, this._game, startPosition[0], startPosition[1], sprite);

    this.scale.setTo(scale, scale);
}

NPC.prototype = Object.create(Phaser.Sprite.prototype);
NPC.prototype.constructor = NPC;

/**
 * Automatically called by World.update
 */
NPC.prototype.update = function() {
    // todo: update
}
