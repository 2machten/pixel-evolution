mainMenu = function(game) {
    Phaser.State.call(this); 

    this.game = game;
    this.freeTiles = [];
    this.ticks = 0;
}

//Extend the player object to be a Phaser.State
mainMenu.prototype = Object.create(Phaser.State.prototype);
mainMenu.prototype.constructor = mainMenu;


mainMenu.prototype.preload = function(){
    this.load.image('logo', 'assets/logo.png');
    this.load.image('background', 'assets/pixel_bg.png');
}

mainMenu.prototype.create = function(){
	//background
	this.background = this.game.add.tileSprite(0,0, 9999999, this.game.height, 'background');
	
	//logo
	this.logo = this.game.add.sprite(this.game.width/2, (this.game.height* (1/3)), 'logo');
	this.logo.anchor.setTo(0.5, 0.5);

	//text "press start"
    this.text = this.game.add.text(this.game.width/2, (this.game.height* (3/5)), "Press start..", { 
    	font: "20px 'Press Start 2P'", 
    	fill: "#fff", 
    	align: "center" 
    });

    this.text.anchor.set(0.5);
}


mainMenu.prototype.update = function(){
	//scroll background to the left ever so slightly
	this.background.position.x -= 0.3;

	//blink the "press start.." text every 45 ticks
	this.ticks++;
	if(this.ticks > 45){
		this.text.visible = !this.text.visible;
		this.ticks = 0;
	}

	//when clicked or any key is pressed: start the game
	if(this.game.input.activePointer.isDown){ transitions.to('rpg'); }
	this.game.input.keyboard.onDownCallback = function(e) { transitions.to('rpg'); }
}

