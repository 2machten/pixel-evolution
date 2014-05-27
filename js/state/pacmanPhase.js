pacmanPhase = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.freeTiles = [];
}

//Extend the pacmanPhase object to be a Phaser.State
pacmanPhase.prototype = Object.create(Phaser.State.prototype);
pacmanPhase.prototype.constructor = pacmanPhase;


pacmanPhase.prototype.create = function(){
}

pacmanPhase.prototype.update = function(){
}