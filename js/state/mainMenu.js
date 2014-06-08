mainMenu = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.ticks = 0;
    this._game.stage.smoothed = false;
}

//Extend the mainMenu object to be a Phaser.State
mainMenu.prototype = Object.create(Phaser.State.prototype);
mainMenu.prototype.constructor = mainMenu;

mainMenu.prototype.create = function(){
	//background
	this.background = this._game.add.tileSprite(0,0, 9999999, this._game.height, 'background');
	
	//logo
	this.logo = this._game.add.sprite(this._game.width/2, (this._game.height* (1/3)), 'logo');
	this.logo.anchor.setTo(0.5, 0.5);

	//text "press start"
    this.text = this._game.add.text(this._game.width/2, (this._game.height* (3/5)), "Press start..", { 
    	font: "20px 'Press Start 2P'", 
    	fill: "#fff", 
    	align: "center" 
    });

    this.text.anchor.set(0.5);
}


mainMenu.prototype.update = function(){
	//scroll background to the left ever so slightly
	this.background.position.x -= 0.4;

	//blink the "press start.." text every 45 ticks
	this.ticks++;
	if(this.ticks > 45){
		//re-set text so it works when the custom font is loaded.
		this.text.setText("Press start..");

		//toggle visibility
		this.text.visible = !this.text.visible;
		this.ticks = 0;
	}

	//when clicked: start the game
	if(this.input.activePointer.isDown){ transitions.to('pixel'); }
}

