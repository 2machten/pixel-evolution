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

    this._questFinished = false;
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
            this._game.physics.arcade.collide(this._player, this._orangegroup, this.orangeboxCollision, null, this);
        } catch (e) {}
    }
}

/**
 * Collision handler for orangebox.
 *
 * Makes the orangebox dissapear and finishes the quest.
 */
NPC.prototype.orangeboxCollision = function(player, orangebox) {
    this._questFinished = true;
    console.log(this);

    orangebox.destroy();
}

NPC.prototype.spawnOrangeBox = function(player, npc) {
    if (this._questFinished) {
        // give end text and dissapear
        player._game.showMessage("Thank you! Now I can play portal again!");

        npc.destroy();
    } else if (npc._hasOrangeBox) {
        player._game.showMessage("Go fast! Find the orange box!");
    } else {
        player._game.showMessage("Go fast! Find the orange box!");
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
