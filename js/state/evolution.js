evolution = function(game) {
    Phaser.State.call(this); 

    this._game = game;
    this.ticks = 0;
    this._game.stage.smoothed = false;
}

var introDone = false;
var modulo = 50;
var secondModulo = 2;

//Extend the evolution object to be a Phaser.State
evolution.prototype = Object.create(Phaser.State.prototype);
evolution.prototype.constructor = evolution;

evolution.prototype.create = function(){
	introDone = false;
	modulo = 50;
	secondModulo = 2;

	this.stage.backgroundColor = 0x0f4737;

	this._game.showMessage("What? Mixel is evolving!");

	var firstSprite;
	var secondSprite;

	if(this._game._level == 3){
		firstSprite = 'player_pixel3';
		secondSprite = 'player_pacman1';
	} else if (this._game._level == 6){
		firstSprite = 'player_pacman1';
		secondSprite = 'player_dungeon1';
	} else if (this._game._level == 9){
		firstSprite = 'player_dungeon3';
		secondSprite = 'player_rpg';
	}

	this._firstCharacter = this._game.add.sprite(this._game.camera.width/2, this._game.camera.height/2 - 50, firstSprite);
	this._secondCharacter = this._game.add.sprite(this._game.camera.width/2, this._game.camera.height/2 - 50, secondSprite);

	//set to 4th frame if applicable (make sure pacman looks to the right)
	if(this._game._level < 8){
		this._firstCharacter.frame  = 3; 
		this._secondCharacter.frame = 3;
	}

	this._firstCharacter.anchor.setTo(0.5, 0.5);
	this._secondCharacter.anchor.setTo(0.5, 0.5);

	//make sure all sprite are the same size, large
	this._firstCharacter.width = 150;
	this._firstCharacter.height = 150;
	this._secondCharacter.width = 200;
	this._secondCharacter.height = 200;


	//this._firstCharacter.tint = 0x000000;
	this._secondCharacter.tint = 0x000000;

	this._firstCharacter.alpha = 0;
	this._secondCharacter.alpha = 0;

	var fadeIn = this._game.add.tween(this._firstCharacter).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None).delay(500).start();

	//Color tween
	var obj = this._firstCharacter;
	var startColor = 0xffffff;
	var endColor = 0x000000;
	var time = 1000;

	var colorBlend = {step: 0};
    var colorTween = pixelEvolution.add.tween(colorBlend).to({step: 100}, time);
    colorTween.onUpdateCallback(function() {
      obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);   
    });

    obj.tint = startColor; 
    colorTween.delay(1000);

    fadeIn.chain(colorTween);
    colorTween.onComplete = {dispatch:function(){ introDone = true; }};
}

evolution.prototype.update = function(){
	if(introDone){
		this.ticks++;

			if(modulo > 0){
				if(this.ticks % modulo == 0 && this._firstCharacter.alpha == 1){
					this.ticks = 0;
					modulo -= 5;
					this._firstCharacter.alpha = 0;
					this._secondCharacter.alpha = 1;
				} else {
					this._firstCharacter.alpha = 1;
					this._secondCharacter.alpha = 0;
				}
			} else if (secondModulo < 30) {
				if(this.ticks % secondModulo == 0 && this._secondCharacter.alpha == 1){
					this.ticks = 0;
					secondModulo += 10;
					this._secondCharacter.alpha = 0;
					this._firstCharacter.alpha = 1;
				} else {
					this._secondCharacter.alpha = 1;
					this._firstCharacter.alpha = 0;
				}
			} else if (secondModulo < 40) {
				this._secondCharacter.alpha = 1;
				this._firstCharacter.alpha = 0;
				
				var obj = this._secondCharacter;
				var startColor = 0x000000;
				var endColor = 0xffffff;
				var time = 1000;

				var colorBlend = {step: 0};
			    var colorTween = pixelEvolution.add.tween(colorBlend).to({step: 100}, time);
			    colorTween.onUpdateCallback(function() {
			      obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);   
			    });

			    obj.tint = startColor; 
			    colorTween.start();

			    this._game.showMessage("Nice! Mixel now knows additional skills!");

			    this.ticks =0;

			    //very hacky way to end this if
			    secondModulo = 100;
			} else {
				if(this.input.activePointer.isDown){
					this.transitionToNextLevel();
				}
			}
	}
	
}

evolution.prototype.transitionToNextLevel = function() {
	if(this._game._level == 3){
		
		setTimeout((function(self) { return function() {  
			self._game.showMessage("Am I faster? I probably need this \n new speed for something..");
            if(self._game.input.activePointer.isDown) {
				transitions.to('pacman');
			}
        }})(this),70); 
		
	} else if (this._game._level == 6){
		setTimeout((function(self) { return function() {  
			self._game.showMessage("Wait, where did this Zword come from?");
			if(self._game.input.activePointer.isDown) {
				transitions.to('dungeon');
			}
        }})(this),70); 
		
	} else if (this._game._level == 9){
		setTimeout((function(self) { return function() {  
			self._game.showMessage("Hey, more people! Maybe I can talk to them.");
			if (self._game.input.activePointer.isDown) {
				transitions.to('rpg');
			}
        }})(this),70);
		
	}	
}