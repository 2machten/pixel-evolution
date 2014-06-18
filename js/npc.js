NPC = function(game, scale, sprite) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    startPosition = state.getItemPosition();
    
    Phaser.Sprite.call(this, this._game, startPosition[0], startPosition[1], sprite);

    this.scale.setTo(scale, scale);

    this._hasOrangeBox = false;
    this._orangebox = undefined;
    this._orangegroup =  new Phaser.Group(this._game, null, "orangebox", false);
    this._player = undefined;
}

NPC.prototype = Object.create(Phaser.Sprite.prototype);
NPC.prototype.constructor = NPC;

/**
 * Automatically called by World.update
 */
NPC.prototype.update = function() {
    // collide with orangebox
    if (this._hasOrangeBox) {
        try {
            this._game.physics.arcade.collide(this._player, this._orangegroup, function() {
                console.log("aapjes");
            }, null, this);
        } catch (e) {}
    }
}


NPC.prototype.spawnOrangeBox = function(player, npc) {
    if (npc._hasOrangeBox) {
        // we are still looking for it
        console.log("exists");
    } else {
        // hacks
        npc._player = player;
        // spawn 'orange box'
        var spawnPosition = player._game.state.getCurrentState().getItemPosition();

        npc._orangebox = player._game.add.sprite(spawnPosition[0], spawnPosition[1], 'orange_box');
        player._game.physics.enable(npc._orangebox);
        npc._orangebox.body.immovable = true;

        npc._orangegroup.add(npc._orangebox);

        player._game.add.existing(npc._orangegroup);

        npc._hasOrangeBox = true;
    }
}
