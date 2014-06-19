end = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.ticks = 0;
    this._game.stage.smoothed = false;
}

//Extend the loader object to be a Phaser.State
end.prototype = Object.create(Phaser.State.prototype);
end.prototype.constructor = end;


end.prototype.preload = function(){
}

end.prototype.create = function(){
    this._endtext = this.add.text(this.camera.width/2, this.camera.height/2 - 100, 
    	"Imagine a fancy\nend scene where you\ndefeat the evil gamer.", 
    	{ font: "30px 'Press Start 2P'", fill: "#fff" });

    this._endtext.anchor.setTo(0.5, 0.5);
    this._endtext.lineSpacing = 25;
    this._endtext.align = 'center';

    this._endtext2 = this.add.text(this.camera.width/2, this.camera.height/2 + 100, 
    	"THE END", 
    	{ font: "50px 'Press Start 2P'", fill: "#fff" });

    this._endtext2.anchor.setTo(0.5, 0.5);
    this._endtext2.lineSpacing = 15;
}

