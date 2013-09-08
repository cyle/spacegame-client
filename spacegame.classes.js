/*

	classes used in the SPACE GAME!

*/


/*

	bullet

*/

function Bullet(x, y, angle, scene) {
	this.x = x;
	this.y = y;
	this.z = 0.0;
	this.distanceTravelled = 0.0; // how far has it gone so far
	this.distanceLimit = 30; // when should it stop travelling
	this.distancePerTick = 0.0; // how many units does it travel per update
	this.currentSpeed = 35; // the speed of it (constant)
	this.angle = angle; // the angle it's travelling at
	
	// the bullet's sprite
	this.bulletSpriteManager = new BABYLON.SpriteManager('bulletSprites', 'assets/blaster.png', 2, 10, scene);
	this.bulletSprite = new BABYLON.Sprite('bullet', this.bulletSpriteManager);
	this.bulletSprite.position = new BABYLON.Vector3(this.x, this.y, this.z);
	this.bulletSprite.angle = this.angle * -1; // for some reason sprite angles are inverted
	
	// the hit box
	this.hitBox = new BABYLON.Mesh.CreateBox('bullet-hitbox', 1, scene);
	this.hitBox.position = this.bulletSprite.position;
	this.hitBox.rotation.z = angle;
	this.hitBox.isVisible = false;
	
	// state
	this.done = false; // has it reached its limit?
	this.didHit = false; // has it hit something?
}

Bullet.prototype.update = function(dTime) {
	if (this.done == true) { // if it has reached its limit, dispose of the mesh
		this.hitBox.dispose();
		this.bulletSpriteManager.dispose(); // clear up resources
		return; // that's all
	}
	// travel:
	this.x += (Math.sin(this.angle) * -this.currentSpeed) * dTime;
	this.y += (Math.cos(this.angle) * this.currentSpeed) * dTime;
	if (this.distancePerTick == 0.0) { // figure out how far it travels per update
		this.distancePerTick = Math.sqrt( Math.pow(this.x - this.bulletSprite.position.x, 2) + Math.pow(this.y - this.bulletSprite.position.y, 2) );
	}
	this.bulletSprite.position.x = this.x; // set the sprite's position
	this.bulletSprite.position.y = this.y;
	this.hitBox.position = this.bulletSprite.position; // move the hitbox
	this.distanceTravelled += this.distancePerTick; // add how far it's gone so far
	if (this.distanceTravelled >= this.distanceLimit) { // gone far enough?
		this.done = true; // done, kid
	}
}

Bullet.prototype.checkCollisions = function(scene) {	
	for (j = 0; j < scene.meshes.length; j++) {
		//console.log('checking if bullet hit ' + scene.meshes[i].name);
		if (scene.meshes[j].name != 'BULLET' && scene.meshes[j].hasOwnProperty('solid') && scene.meshes[j].solid == true && scene.meshes[j].intersectsMesh(this.hitBox, true)) {
			console.log('bullet hit ' + scene.meshes[j].name);
			this.didHit = { x: scene.meshes[j].position.x, y: scene.meshes[j].position.y };
			if (scene.meshes[j].name.indexOf('asteroid') !== -1) {
				scene.meshes[j].dispose();
			}
			this.done = true;
			break;
		}
	}
}


/*

	random other spaceship
	
*/

function OtherShip(name, x, y, angle, scene) {
	
	// location data
	this.name = name;
	this.x = x;
	this.y = y;
	this.z = 0.0; // z will probably stay zero foreverrrr
	this.currentRotation = angle;
	this.hpCurrent = 50;
	this.hpMax = 50;
	this.done = false;
	
	this.objects = []; // will hold all of the meshes that make up this object
	this.forwardThrusters = [];
	this.reverseThrusters = [];
	
	// the origin's position is relative to the object's x and y origin
	var shipOriginBox = BABYLON.Mesh.CreateBox("player-"+this.name+"-spaceship-origin", 2.0, scene);
	shipOriginBox.position = new BABYLON.Vector3(this.x + 0, this.y + 0, 0);
	shipOriginBox.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	shipOriginBox.collideWith = true;
	shipOriginBox.solid = true;
	
	// now all subsequent meshes will be relative to that origin
	var box2 = BABYLON.Mesh.CreateBox("player-"+this.name+"-spaceship-piece2", 1.0, scene);
	box2.parent = shipOriginBox;
	box2.position = new BABYLON.Vector3(1, -1, 0);
	box2.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	box2.collideWith = true;
	box2.solid = true;
	
	var box3 = BABYLON.Mesh.CreateBox("player-"+this.name+"-spaceship-piece3", 1.0, scene);
	box3.parent = shipOriginBox;
	box3.position = new BABYLON.Vector3(-1, -1, 0);
	box3.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	box3.collideWith = true;
	box3.solid = true;
	
	// add those meshes to this ship's list of objects
	this.objects.push(shipOriginBox);
	this.objects.push(box2);
	this.objects.push(box3);
	
	var thrusterMaterial = new BABYLON.Texture("assets/flare.png", scene);
	
	var particleSystemOne = new BABYLON.ParticleSystem("thrust-particles-1", 2000, scene);
	particleSystemOne.emitter = box2; // Where the particles comes from
	var particleSystemTwo = new BABYLON.ParticleSystem("thrust-particles-2", 2000, scene);
	particleSystemTwo.emitter = box3; // Where the particles comes from
	this.forwardThrusters.push(particleSystemOne);
	this.forwardThrusters.push(particleSystemTwo);
	for (p = 0; p < this.forwardThrusters.length; p++) {
		this.forwardThrusters[p].particleTexture = thrusterMaterial;
		this.forwardThrusters[p].textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
		this.forwardThrusters[p].color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		this.forwardThrusters[p].color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		this.forwardThrusters[p].colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		this.forwardThrusters[p].minSize = 0.1;
		this.forwardThrusters[p].maxSize = 0.4;
		this.forwardThrusters[p].minLifeTime = 0.2;
		this.forwardThrusters[p].maxLifeTime = 0.5;
		this.forwardThrusters[p].emitRate = 500; // how many at a time
		this.forwardThrusters[p].blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.forwardThrusters[p].direction1 = new BABYLON.Vector3(-2, -8, 1); // potential direction of each particle after it has been emitted
		this.forwardThrusters[p].direction2 = new BABYLON.Vector3(2, -8, -1); // potential direction of each particle after it has been emitted
	}
	
	var particleSystemThree = new BABYLON.ParticleSystem("thrust-particles-3", 2000, scene);
	particleSystemThree.emitter = box2; // Where the particles comes from
	var particleSystemFour = new BABYLON.ParticleSystem("thrust-particles-4", 2000, scene);
	particleSystemFour.emitter = box3; // Where the particles comes from
	this.reverseThrusters.push(particleSystemThree);
	this.reverseThrusters.push(particleSystemFour);
	for (p = 0; p < this.reverseThrusters.length; p++) {
		this.reverseThrusters[p].particleTexture = thrusterMaterial;
		this.reverseThrusters[p].textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
		this.reverseThrusters[p].color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		this.reverseThrusters[p].color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		this.reverseThrusters[p].colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		this.reverseThrusters[p].minSize = 0.1;
		this.reverseThrusters[p].maxSize = 0.4;
		this.reverseThrusters[p].minLifeTime = 0.2;
		this.reverseThrusters[p].maxLifeTime = 0.5;
		this.reverseThrusters[p].emitRate = 500; // how many at a time
		this.reverseThrusters[p].blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.reverseThrusters[p].direction1 = new BABYLON.Vector3(-2, 8, 1); // potential direction of each particle after it has been emitted
		this.reverseThrusters[p].direction2 = new BABYLON.Vector3(2, 8, -1); // potential direction of each particle after it has been emitted
	}
	
	this.update(this.x, this.y, this.currentRotation, 0); // run an update on yourself to orient things properly
	
}

OtherShip.prototype.update = function(x, y, angle, direction) {
	
	// set normal colors...
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
		this.objects[i].material.alpha = 1.0;
	}
	
	if (direction < 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = -1; // thrusting in reverse
		for (var i = 0; i < this.reverseThrusters.length; i++) {
			this.reverseThrusters[i].start();
		}
	} else if (direction > 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = 1; // thrusting forward
		for (var i = 0; i < this.forwardThrusters.length; i++) {
			this.forwardThrusters[i].start();
		}
	} else {
		this.currentlyThrusting = false; // not thrusting at all
		this.currentThrustingDirection = 0;
		for (var i = 0; i < this.forwardThrusters.length; i++) {
			this.forwardThrusters[i].stop();
		}
		for (var i = 0; i < this.reverseThrusters.length; i++) {
			this.reverseThrusters[i].stop();
		}
	}
	
	// move just the origin element
	this.objects[0].position.x = x;
	this.objects[0].position.y = y;
	
	// rotate just the origin element
	this.objects[0].rotation.z = angle;
	
	// update our actual position
	this.x = this.objects[0].position.x;
	this.y = this.objects[0].position.y;
	
	// update our actual rotation
	this.currentRotation = angle;
	
}

OtherShip.prototype.dispose = function() {
	console.log('disposing of ' + this.name);
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].isDisposed() == false) {
			this.objects[i].dispose(); // clear up resources
		}
	}
}



/*

	player's space ship

*/


function PlayerShip(x, y, angle, scene) {
	
	// location data
	this.x = x;
	this.y = y;
	this.z = 0.0; // z will probably stay zero foreverrrr
	
	// player health info
	this.hpCurrent = 50;
	this.hpMax = 50;
	
	// player state
	this.playerState = 'normal'; // may hold values like: invisible, ..., ...
	
	// player orientation/movement info
	this.currentThrustingDirection = 0; // 0 = not moving, -1 = backwards, 1 = forwards
	this.currentlyThrusting = false;
	this.currentSpeed = 0.0;
	this.currentRotation = angle;
	this.movingRotation = 0.0;
	this.oppositeMovingAngle = 0.0;
	
	// player ship physics info
	this.maxSpeed = 10; // in units per second
	this.minSpeed = -4; // in units per second
	this.accelerationRate = 5; // in units per second, constant
	this.decelerationRate = 4; // in units per second, constant
	this.rotationRate = 2; // in radians per second
	this.rotationThrustRate = 2; // in radians per second
	this.instantTurnSpeed = 3; // speed (units per second) at which the ship just turns instantly
	this.acuteTurnThreshold = degreesToRadians(90); // +/- this number will be an easy "acute" turn
	this.wideTurnThreshold = degreesToRadians(140); // between acute and this number will be a hard "wide" turn
	
	this.objects = []; // will hold all of the meshes that make up this object
	this.forwardThrusters = [];
	this.reverseThrusters = [];
		
	// the origin's position is relative to the object's x and y origin
	var shipOriginBox = BABYLON.Mesh.CreateBox("spaceship-origin", 2.0, scene);
	shipOriginBox.position = new BABYLON.Vector3(this.x + 0, this.y + 0, 0);
	shipOriginBox.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	
	// now all subsequent meshes will be relative to that origin
	var box2 = BABYLON.Mesh.CreateBox("spaceship-piece2", 1.0, scene);
	box2.parent = shipOriginBox;
	box2.position = new BABYLON.Vector3(1, -1, 0);
	box2.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	
	var box3 = BABYLON.Mesh.CreateBox("spaceship-piece3", 1.0, scene);
	box3.parent = shipOriginBox;
	box3.position = new BABYLON.Vector3(-1, -1, 0);
	box3.material = new BABYLON.StandardMaterial("spaceship-material", scene);
		
	// add those meshes to this ship's list of objects
	this.objects.push(shipOriginBox);
	this.objects.push(box2);
	this.objects.push(box3);
	
	var thrusterMaterial = new BABYLON.Texture("assets/flare.png", scene);
	
	var particleSystemOne = new BABYLON.ParticleSystem("thrust-particles-1", 2000, scene);
	particleSystemOne.emitter = box2; // Where the particles comes from
	var particleSystemTwo = new BABYLON.ParticleSystem("thrust-particles-2", 2000, scene);
	particleSystemTwo.emitter = box3; // Where the particles comes from
	this.forwardThrusters.push(particleSystemOne);
	this.forwardThrusters.push(particleSystemTwo);
	for (p = 0; p < this.forwardThrusters.length; p++) {
		this.forwardThrusters[p].particleTexture = thrusterMaterial;
		this.forwardThrusters[p].textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
		this.forwardThrusters[p].color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		this.forwardThrusters[p].color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		this.forwardThrusters[p].colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		this.forwardThrusters[p].minSize = 0.1;
		this.forwardThrusters[p].maxSize = 0.4;
		this.forwardThrusters[p].minLifeTime = 0.2;
		this.forwardThrusters[p].maxLifeTime = 0.5;
		this.forwardThrusters[p].emitRate = 500; // how many at a time
		this.forwardThrusters[p].blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.forwardThrusters[p].direction1 = new BABYLON.Vector3(-2, -8, 1); // potential direction of each particle after it has been emitted
		this.forwardThrusters[p].direction2 = new BABYLON.Vector3(2, -8, -1); // potential direction of each particle after it has been emitted
	}
	
	var particleSystemThree = new BABYLON.ParticleSystem("thrust-particles-3", 2000, scene);
	particleSystemThree.emitter = box2; // Where the particles comes from
	var particleSystemFour = new BABYLON.ParticleSystem("thrust-particles-4", 2000, scene);
	particleSystemFour.emitter = box3; // Where the particles comes from
	this.reverseThrusters.push(particleSystemThree);
	this.reverseThrusters.push(particleSystemFour);
	for (p = 0; p < this.reverseThrusters.length; p++) {
		this.reverseThrusters[p].particleTexture = thrusterMaterial;
		this.reverseThrusters[p].textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
		this.reverseThrusters[p].color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		this.reverseThrusters[p].color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		this.reverseThrusters[p].colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		this.reverseThrusters[p].minSize = 0.1;
		this.reverseThrusters[p].maxSize = 0.4;
		this.reverseThrusters[p].minLifeTime = 0.2;
		this.reverseThrusters[p].maxLifeTime = 0.5;
		this.reverseThrusters[p].emitRate = 500; // how many at a time
		this.reverseThrusters[p].blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.reverseThrusters[p].direction1 = new BABYLON.Vector3(-2, 8, 1); // potential direction of each particle after it has been emitted
		this.reverseThrusters[p].direction2 = new BABYLON.Vector3(2, 8, -1); // potential direction of each particle after it has been emitted
	}
	
	//console.log('new player ship set up!');
	//console.log(this);
	
}

PlayerShip.prototype.rotate = function(direction, dTime) {
	
	// rotate left or right based on direction given
	if (direction < 0) {
		this.currentRotation -= (this.rotationRate * dTime); // left
	} else if (direction > 0) {
		this.currentRotation += (this.rotationRate * dTime); // right
	}
	
	// keep rotation within bounds
	if (this.currentRotation > Math.PI * 2) {
		this.currentRotation = this.currentRotation - (Math.PI * 2);
	} else if (this.currentRotation < 0) {
		this.currentRotation = (Math.PI * 2) - this.currentRotation;
	}
	
}

PlayerShip.prototype.brake = function(dTime) {
	if (this.currentSpeed > 0) {
		this.currentSpeed -= (this.decelerationRate * dTime);
		if (this.currentSpeed < 0) { // deceleration rate took us under zero, oops, fix it
			this.currentSpeed = 0;
		}
	} else if (this.currentSpeed < 0) {
		this.currentSpeed += (this.decelerationRate * dTime);
		if (this.currentSpeed > 0) { // deceleration rate took us over zero, oops, fix it
			this.currentSpeed = 0;
		}
	}
}

PlayerShip.prototype.setDirection = function(direction) {
	if (direction < 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = -1; // thrusting in reverse
		for (var i = 0; i < this.reverseThrusters.length; i++) {
			this.reverseThrusters[i].start();
		}
	} else if (direction > 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = 1; // thrusting forward
		for (var i = 0; i < this.forwardThrusters.length; i++) {
			this.forwardThrusters[i].start();
		}
	} else {
		this.currentlyThrusting = false; // not thrusting at all
		this.currentThrustingDirection = 0;
		for (var i = 0; i < this.forwardThrusters.length; i++) {
			this.forwardThrusters[i].stop();
		}
		for (var i = 0; i < this.reverseThrusters.length; i++) {
			this.reverseThrusters[i].stop();
		}
	}
}

PlayerShip.prototype.collided = function(dTime) {
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
	}
	//console.log('collided with solid object');
	this.movingRotation = this.oppositeMovingAngle;
	this.currentSpeed = this.currentSpeed * 0.5; // cut speed in half
	
	this.objects[0].position.x += Math.sin(this.movingRotation) * -0.25; // bump away
	this.objects[0].position.y += Math.cos(this.movingRotation) * 0.25; // bump away
	
	//this.objects[0].position.x += (Math.sin(this.movingRotation) * -4) * dTime; // bump away at 4 units per second
	//this.objects[0].position.y += (Math.cos(this.movingRotation) * 4) * dTime; // bump away at 4 units per second
	
	// update our actual position
	this.x = this.objects[0].position.x;
	this.y = this.objects[0].position.y;
}

PlayerShip.prototype.safeZoned = function() {
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
	}
}

PlayerShip.prototype.invisible = function() {
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.alpha = 0.15;
	}
	this.playerState = 'invisible';
}

PlayerShip.prototype.checkCollisions = function(scene, dTime) {

	// set normal colors...
	for (var i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
		this.objects[i].material.alpha = 1.0;
	}
	
	// has there been a collision...?
	var collided = false;
	
	// go through all of the meshes in the scene, check for a collision
	for (var i = 0; i < scene.meshes.length; i++) {
		if (scene.meshes[i].hasOwnProperty('collideWith') && scene.meshes[i].collideWith == true) {
			// if i can collide with it, check against all of the ship's meshes
			for (j = 0; j < this.objects.length; j++) {
				if (scene.meshes[i].intersectsMesh(this.objects[j], true)) {
					// turn the origin box blue if it collides with something
					if (scene.meshes[i].hasOwnProperty('solid') && scene.meshes[i].solid == true) {
						this.collided(dTime);
						collided = true;
						break;
					} else if (scene.meshes[i].hasOwnProperty('nebula') && scene.meshes[i].nebula == true) {
						this.invisible();
						collided = true;
						break;
					} else if (scene.meshes[i].hasOwnProperty('safeZone') && scene.meshes[i].safeZone == true) {
						this.safeZoned();
						collided = true;
						break;
					}
				}
			}
			if (collided) { break; }
		}
	}
}

PlayerShip.prototype.update = function(dTime) {
	// move the position of all objects the same way
	
	// reset player state to normal
	this.playerState = 'normal';
	
	// if something moved our player position, make it so
	this.objects[0].position.x = this.x;
	this.objects[0].position.y = this.y;
	
	// rotate just the origin element, all others are already tied to it
	this.objects[0].rotation.z = this.currentRotation;
	
	// ok, go through everything
	// get the opposite angle to how we are currently moving
	if (this.movingRotation <= Math.PI * 2 && this.movingRotation > Math.PI) {
		this.oppositeMovingAngle = this.movingRotation - Math.PI;
	} else {
		this.oppositeMovingAngle = this.movingRotation + Math.PI;
	}
	//console.log('opposite angle to how we are moving: ' + oppositeMovingAngle);
	
	// if we are thrusting in a direction, try to move along the ship's current rotation
	if (this.movingRotation != this.currentRotation && this.currentlyThrusting) {
		
		// get the difference between how we are moving and how we want to move
		var angleDiff = Math.abs(this.movingRotation - this.currentRotation);
		if (angleDiff > Math.PI) {
			angleDiff = (Math.PI * 2) - angleDiff;
		}
		
		//console.log('angle diff between current moving and facing: ' + angleDiff + '/' + Math.PI);
		//console.log('percent diff: ' + Math.round((angleDiff / Math.PI) * 100) );
		
		/*
		
		what to do:
		
		- if the new angle (current facing direction) is near a 180-degree turn, (WIDE TURN THRESHOLD)
			make the ship slow til it reaches 0 and then accelerate in the new direction
		- if the new angle is within the 90-degree cone of where you were moving, (ACUTE TURN THRESHOLD)
			make the ship slow down a tiny bit til it reaches the new angle
		- if the new angle is not a full 180, but over the 90-degree cone, (REGULAR TURN THRESHOLD)
			make the ship slow down a little and then accelerate as usual
		
		*/
		
		
		/*
		
		measurements...
		relative direction, PI, degrees, radians
		
		STRAIGHT AHEAD = PI * 0 or 0 degrees or 0 radians
		RIGHT = PI * 0.5 or 90 degrees or ~1.57 radians
		BACKWARDS = PI * 1 or 180 degrees or ~3.14 radians
		LEFT = PI * 1.25 or 270 degrees or ~3.93 radians
		FULL CIRCLE = PI * 2 or 360 degrees or ~6.28 radians
		
		*/
		
		// if the ship is moving slowly, just turn
		if (this.currentSpeed <= this.instantTurnSpeed) {
			
			//console.log('moving slowly, just go the new direction');
			
			this.movingRotation = this.currentRotation;
			this.currentSpeed += (this.accelerationRate * this.currentThrustingDirection)  * dTime;
			
		} else { // otherwise, use the above acute/wide/180 degree turn rules
			
			// if the new angle (currentRotation) is within the acuteTurnThreshold, slow down acceleration a little and increment the movingRotation at normal speed
			// if the new angle (currentRotation) is higher than the acuteTurnThreshold but less than the wideTurnThreshold, slow down accelerate and increment the movingRotation slowly
			// if the new angle (currentRotation) is higher than the wideTurnThreshold, slowly accelerate in the new direction
			
			if (angleDiff <= this.acuteTurnThreshold) {
				// acute turn, easy
				
				//console.log('performing an ACUTE turn');
				
				// ok, this part is tricky because of how (Math.PI * 2) radians == 0 radians, or rather, 360 degrees == 0 degrees
				// so when turning, for example, from currentRotation = 290 to currentRotation = 25,
				//   we don't want to have to go all the way from 290 to 25...
				//   we want to go from 290 to 360 and then from 0 to 25
				// this is repeated in the "wide turn" section
				if (this.currentRotation <= (Math.PI * 2) && this.currentRotation >= (Math.PI * 2 - this.acuteTurnThreshold) && this.movingRotation >= 0 && this.movingRotation <= this.acuteTurnThreshold) {
					this.movingRotation -= (this.rotationThrustRate * dTime);
					if (this.movingRotation <= 0) {
						this.movingRotation = Math.PI * 2;
					}
				} else if (this.movingRotation <= (Math.PI * 2) && this.movingRotation >= (Math.PI * 2 - this.acuteTurnThreshold) && this.currentRotation >= 0 && this.currentRotation <= this.acuteTurnThreshold) {
					this.movingRotation += (this.rotationThrustRate * dTime);
					if (this.movingRotation >= Math.PI * 2) {
						this.movingRotation = 0;
					}
				} else {
					if (this.currentRotation > this.movingRotation) {
						this.movingRotation += (this.rotationThrustRate * dTime);
					} else if (this.currentRotation < this.movingRotation) {
						this.movingRotation -= (this.rotationThrustRate * dTime);
					}
				}
				
				if (angleDiff < (Math.PI/2)) {
					this.currentSpeed += (this.accelerationRate * this.currentThrustingDirection) * dTime;
				} else {
					this.currentSpeed -= (this.accelerationRate * this.currentThrustingDirection) * dTime;
				}
				
			} else if (angleDiff > this.acuteTurnThreshold && angleDiff <= this.wideTurnThreshold) {
				// wide turn, medium
				
				//console.log('performing a WIDE turn');
				
				if (this.currentRotation <= (Math.PI * 2) && this.currentRotation >= (Math.PI * 2 - this.wideTurnThreshold) && this.movingRotation >= 0 && this.movingRotation <= this.wideTurnThreshold) {
					this.movingRotation -= (this.rotationThrustRate * 0.5) * dTime;
					if (this.movingRotation <= 0) {
						this.movingRotation = Math.PI * 2;
					}
				} else if (this.movingRotation <= (Math.PI * 2) && this.movingRotation >= (Math.PI * 2 - this.wideTurnThreshold) && this.currentRotation >= 0 && this.currentRotation <= this.wideTurnThreshold) {
					this.movingRotation += (this.rotationThrustRate * 0.5) * dTime;
					if (this.movingRotation >= Math.PI * 2) {
						this.movingRotation = 0;
					}
				} else {
					if (this.currentRotation > this.movingRotation) {
						this.movingRotation += (this.rotationThrustRate * 0.5) * dTime;
					} else if (this.currentRotation < this.movingRotation) {
						this.movingRotation -= (this.rotationThrustRate * 0.5) * dTime;
					}
				}
				
				if (angleDiff < (Math.PI/2)) {
					this.currentSpeed += ((this.accelerationRate * 0.5) * this.currentThrustingDirection) * dTime;
				} else {
					this.currentSpeed -= ((this.accelerationRate * 0.5) * this.currentThrustingDirection) * dTime;
				}
				
			} else {
				// full 180 turn, hard
				
				//console.log('performing a 180-DEGREE turn');
				
				if (this.currentSpeed > 0) { // slow down to 0 speed before continuing before continuing along the new angle
					this.currentSpeed -= ((this.accelerationRate * 0.25) * this.currentThrustingDirection) * dTime;
				} else if (currentSpeed < 0) { // speed up to 0 speed before continuing along the new angle
					this.currentSpeed += ((this.accelerationRate * 0.25) * this.currentThrustingDirection) * dTime;
				}
			}
			
		}
		
	} else if (this.movingRotation == this.currentRotation && this.currentlyThrusting) { // we are just moving straight ahead
		
		// just accelerate!
		//console.log('no turning, just accelerating');
		this.currentSpeed += (this.accelerationRate * this.currentThrustingDirection) * dTime;
		
	} else {
		
		// we are not thrusting, so just keep moving straight at the same speed
		//console.log('not thrusting, just cruising');
		
	}
	
	// keep speed within bounds
	if (this.currentSpeed > this.maxSpeed) {
		this.currentSpeed = this.maxSpeed;
	}
	if (this.currentSpeed < this.minSpeed) {
		this.currentSpeed = this.minSpeed;
	}

	// move just the origin element
	this.objects[0].position.x += (Math.sin(this.movingRotation) * -this.currentSpeed) * dTime;
	this.objects[0].position.y += (Math.cos(this.movingRotation) * this.currentSpeed) * dTime;
	
	// update our actual position
	this.x = this.objects[0].position.x;
	this.y = this.objects[0].position.y;
}
