boot = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.ticks = 0;
    this._game.stage.smoothed = false;
}

//Extend the loader object to be a Phaser.State
boot.prototype = Object.create(Phaser.State.prototype);
boot.prototype.constructor = boot;


boot.prototype.preload = function(){
    //load preloader
    this.load.image('loaderFull', 'assets/loaderFull.png');
    this.load.image('loaderEmpty', 'assets/loaderEmpty.png');
}

boot.prototype.create = function(){
    this._game.state.start('loader');
}

