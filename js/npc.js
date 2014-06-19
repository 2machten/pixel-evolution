NPC = function(game, scale, sprite, type) {
    this._game = game;
    var state = this._game.state.getCurrentState();

    this._type = type;

    if (type == 'axe') {
        startPosition = state.getAxeNpcPosition();
    } else {
        startPosition = state.getItemPosition();
    }

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
    switch (this._type) {
    case 'axe':
        if (!player._axeSkill) {
            player._game.showMessage("Hello Stranger! Here is an aXe!\nUse the X key to use it!");
            player._axeSkill = true;
        }
        break;
    default:
        if (this._questFinished) {
            // give end text and dissapear
            player._game.showMessage("Thank you! Now I can play portal again!");

            player._chests++;
            player._game._sfx.play('itempickup');
            var textElement = pixelEvolution.state.getCurrentState()._collectableText;
            var newText = parseInt(textElement.text.substring(0,textElement.text.length-1))+1 + "x";
            textElement.setText(newText);

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
        break;
    }
}
