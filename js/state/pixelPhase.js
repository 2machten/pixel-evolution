pixelPhase = function(game) {
    Phaser.State.call(this); 

    this.game = game;
    this.freeTiles = [];
}

//Extend the player object to be a Phaser.State
pixelPhase.prototype = Object.create(Phaser.State.prototype);
pixelPhase.prototype.constructor = pixelPhase;


pixelPhase.prototype.preload = function(){
}

pixelPhase.prototype.create = function(){
}

pixelPhase.prototype.update = function(){
}