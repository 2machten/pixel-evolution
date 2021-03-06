/**
 * WorldMap object, extends Phaser.Tilemap
 */

WorldMap = function(game, key, tileSprite, tileSize, collectableSprite, enemySprite, enemyAmount) {
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
    if(this._game._level == 6 || this._game._level == 7 || this._game._level == 8){
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


    //NPCs
    if(this._game._level > 8){
        this._npcs = new Phaser.Group(this._game, null, "NPCs", false);

        for (var i = 0; i < 3; i++){
            var choice = Math.ceil(ROT.RNG.getUniform() * 7);
            var npc = new NPC(this._game, (32/27), 'npc'+choice+'_rpg', 'default');
            this._game.physics.enable(npc);
            npc.body.immovable = true;
            this._npcs.add(npc);
        }

        // add axe NPC
        var choice = Math.ceil(ROT.RNG.getUniform() * 7);
        var npc = new NPC(this._game, (32/27), 'npc'+choice+'_rpg', 'axe');
        this._game.physics.enable(npc);
        npc.body.immovable = true;
        this._npcs.add(npc);

    }

    //enemies
    if(this._game._level > 6) {
        this._enemies = new Phaser.Group(this._game, null, "enemies", false);

        for (var i = 0; i < enemyAmount; i++){
            var spawnPosition = state.getEnemyPosition();
            var enemy = new Enemy(this._game, 1, enemySprite);
            this._enemies.add(enemy);
        }
    }

    //create a group of items
    this._items = new Phaser.Group(this._game, null, "items", false);
    //spawn collectables in this group
    if (this._game._level >= 9) {
        var numItems = 3;
    } else {
        var numItems = 6;
    }
    for (var i=0; i<numItems; i++){
        var spawnPosition = state.getItemPosition();

        var spriteName;
        if (this._game._level < 3){
            spriteName = collectableSprite + (Math.floor(i/2)+1);
        } else {
            spriteName = collectableSprite;
        }

        var collectable = this._game.add.sprite(spawnPosition[0], spawnPosition[1], spriteName);
        this._game.physics.enable(collectable);
        collectable.body.immovable = true;
        this._items.add(collectable);
    }
}

WorldMap.prototype = Object.create(Phaser.Tilemap.prototype);
WorldMap.prototype.constructor = WorldMap;
