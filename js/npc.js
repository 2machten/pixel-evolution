NPC = function(game, scale, sprite) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    startPosition = state.getItemPosition();
    
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

NPC.prototype.spawnOrangeBox = function(player, npc) {
    // spawn 'orange box'
    var spawnPosition = player._game.state.getCurrentState().getItemPosition();

    var orangebox = player._game.add.sprite(spawnPosition[0], spawnPosition[1], 'orange_box');
    player._game.physics.enable(orangebox);
    orangebox.body.immovable = true;

    var orangegroup = new Phaser.Group(player._game, null, 'collectable_rpg', false);

    orangegroup.add(orangebox);

    player._game.add.existing(orangegroup);
}
