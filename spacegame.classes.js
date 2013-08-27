/*

	classes used in the SPACE GAME!

*/



/*

	test object
	
*/

function TestObject(x, y, scene) {
	
	this.x = x; // the object's current center X
	this.y = y; // the object's current center Y
	this.objects = []; // will hold all of the meshes that make up this object
	
	// the Vector3 positions below are relative to the object's x and y origin
	
	// var box = BABYLON.Mesh.CreateBox("TestBox-piece1", 2.0, scene);
	// box.position = new BABYLON.Vector3(x + 0, y + 0, 0);
	// 
	// var box2 = BABYLON.Mesh.CreateBox("TestBox-piece2", 1.0, scene);
	// box2.position = new BABYLON.Vector3(x + 1, y - 1, 0);
	// 
	// var box3 = BABYLON.Mesh.CreateBox("TestBox-piece3", 1.0, scene);
	// box3.position = new BABYLON.Vector3(x - 1, y - 1, 0);
	// 
	// this.objects.push(box);
	// this.objects.push(box2);
	// this.objects.push(box3);
		
}

TestObject.prototype.update = function() {
	// move the position of all objects the same way
	//console.log('updating a TestObject');
	//console.log(this.objects);
	for (i = 0; i < this.objects.length; i++) {
		//console.log('updating position');
		//this.objects[i].position.x += 0; // don't move sideways
		//this.objects[i].position.y += 0.1; // move slowly forward
		//this.objects[i].rotation.z += 0.1;
	}
}



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
	this.currentSpeed = 0.5; // the speed of it (constant)
	this.angle = angle; // the angle it's travelling at
	this.bulletSphere = BABYLON.Mesh.CreateSphere("BULLET", 2.0, 0.25, scene); // the mesh itself
	this.bulletSphere.position = new BABYLON.Vector3(this.x, this.y, this.z);
	this.done = false; // has it reached its limit?
}

Bullet.prototype.update = function() {
	if (this.done == true) { // if it has reached its limit, dispose of the mesh
		if (this.bulletSphere.isDisposed() == false) {
			this.bulletSphere.dispose(); // clear up resources
		}
		return; // that's all
	}
	// travel:
	this.x += Math.sin(this.angle) * -this.currentSpeed;
	this.y += Math.cos(this.angle) * this.currentSpeed;
	if (this.distancePerTick == 0.0) { // figure out how far it travels per update
		this.distancePerTick = Math.sqrt( Math.pow(this.x - this.bulletSphere.position.x, 2) + Math.pow(this.y - this.bulletSphere.position.y, 2) );
	}
	this.bulletSphere.position.x = this.x; // set the mesh's position
	this.bulletSphere.position.y = this.y;
	this.distanceTravelled += this.distancePerTick; // add how far it's gone so far
	if (this.distanceTravelled >= this.distanceLimit) { // gone far enough?
		this.done = true; // done, kid
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
	
	this.objects = []; // will hold all of the meshes that make up this object
	
	// the origin's position is relative to the object's x and y origin
	var shipOriginBox = BABYLON.Mesh.CreateBox("spaceship-origin", 2.0, scene);
	shipOriginBox.position = new BABYLON.Vector3(this.x + 0, this.y + 0, 0);
	shipOriginBox.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	
	// add those meshes to this ship's list of objects
	this.objects.push(shipOriginBox);
	
}

OtherShip.prototype.update = function(x, y, angle) {
	
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
	if (this.objects[0].isDisposed() == false) {
		this.objects[0].dispose(); // clear up resources
	}
}



/*

	player's space ship

*/


function PlayerShip(x, y, scene) {
	
	// location data
	this.x = x;
	this.y = y;
	this.z = 0.0; // z will probably stay zero foreverrrr
	
	// player box info
	this.currentThrustingDirection = 0; // 0 = not moving, -1 = backwards, 1 = forwards
	this.currentlyThrusting = false;
	this.currentSpeed = 0.0;
	this.currentRotation = 0.0;
	this.movingRotation = 0.0;
	this.oppositeMovingAngle = 0.0;
	this.maxSpeed = 0.2;
	this.minSpeed = -0.1;
	this.accelerationRate = 0.005;
	this.decelerationRate = 0.0075;
	this.rotationRate = 0.05;
	this.rotationThrustRate = 0.05;
	this.instantTurnSpeed = 0.03; // speed at which the ship just turns instantly
	this.acuteTurnThreshold = degreesToRadians(90); // +/- this number will be an easy "acute" turn
	this.wideTurnThreshold = degreesToRadians(140); // between acute and this number will be a hard "wide" turn
	
	this.objects = []; // will hold all of the meshes that make up this object
		
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
	
	var thrustBoxOne = BABYLON.Mesh.CreateBox("spaceship-thrust1", 0.75, scene);
	thrustBoxOne.ignoreColoring = true;
	thrustBoxOne.isThruster = true;
	thrustBoxOne.parent = shipOriginBox;
	thrustBoxOne.position = new BABYLON.Vector3(-1, -1.5, 0);
	thrustBoxOne.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	thrustBoxOne.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
	thrustBoxOne.material.alpha = 0.5;
	thrustBoxOne.isVisible = false;
	
	var thrustBoxTwo = BABYLON.Mesh.CreateBox("spaceship-thrust2", 0.75, scene);
	thrustBoxTwo.ignoreColoring = true;
	thrustBoxTwo.isThruster = true;
	thrustBoxTwo.parent = shipOriginBox;
	thrustBoxTwo.position = new BABYLON.Vector3(1, -1.5, 0);
	thrustBoxTwo.material = new BABYLON.StandardMaterial("spaceship-material", scene);
	thrustBoxTwo.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
	thrustBoxTwo.material.alpha = 0.5;
	thrustBoxTwo.isVisible = false;
		
	// add those meshes to this ship's list of objects
	this.objects.push(shipOriginBox);
	this.objects.push(box2);
	this.objects.push(box3);
	this.objects.push(thrustBoxOne);
	this.objects.push(thrustBoxTwo);
	
}

PlayerShip.prototype.rotate = function(direction) {
	
	// rotate left or right based on direction given
	if (direction < 0) {
		this.currentRotation -= this.rotationRate; // left
	} else if (direction > 0) {
		this.currentRotation += this.rotationRate; // right
	}
	
	// keep rotation within bounds
	if (this.currentRotation > Math.PI * 2) {
		this.currentRotation = this.currentRotation - (Math.PI * 2);
	} else if (this.currentRotation < 0) {
		this.currentRotation = (Math.PI * 2) - this.currentRotation;
	}
	
}

PlayerShip.prototype.brake = function() {
	if (this.currentSpeed > 0) {
		this.currentSpeed -= this.decelerationRate;
		if (this.currentSpeed < 0) { // deceleration rate took us under zero, oops, fix it
			this.currentSpeed = 0;
		}
	} else if (this.currentSpeed < 0) {
		this.currentSpeed += this.decelerationRate;
		if (this.currentSpeed > 0) { // deceleration rate took us over zero, oops, fix it
			this.currentSpeed = 0;
		}
	}
}

PlayerShip.prototype.setDirection = function(direction) {
	if (direction < 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = -1; // thrusting in reverse
	} else if (direction > 0) {
		this.currentlyThrusting = true;
		this.currentThrustingDirection = 1; // thrusting forward
		for (i = 0; i < this.objects.length; i++) {
			if (this.objects[i].hasOwnProperty('isThruster') && this.objects[i].isThruster == true) {
				this.objects[i].isVisible = true;
				this.objects[i].material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
			}
		}
	} else {
		this.currentlyThrusting = false; // not thrusting at all
		this.currentThrustingDirection = 0;
		for (i = 0; i < this.objects.length; i++) {
			if (this.objects[i].hasOwnProperty('isThruster') && this.objects[i].isThruster == true) {
				this.objects[i].isVisible = false;
			}
		}
	}
}

PlayerShip.prototype.collided = function() {
	for (i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
	}
	//console.log('collided with solid object');
	this.movingRotation = this.oppositeMovingAngle;
	this.currentSpeed = this.currentSpeed * 0.5;
	this.objects[0].position.x += Math.sin(this.movingRotation) * -0.5;
	this.objects[0].position.y += Math.cos(this.movingRotation) * 0.5;
}

PlayerShip.prototype.safeZoned = function() {
	for (i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
	}
}

PlayerShip.prototype.invisible = function() {
	for (i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.alpha = 0.15;
	}
}

PlayerShip.prototype.checkCollisions = function(scene) {

	// set normal colors...
	for (i = 0; i < this.objects.length; i++) {
		if (this.objects[i].hasOwnProperty('ignoreColoring') && this.objects[i].ignoreColoring == true) { continue; }
		this.objects[i].material.emissiveColor = new BABYLON.Color4(0, 0, 0, 1);
		this.objects[i].material.alpha = 1.0;
	}
	
	// if we are not at the origin, go for it
	if (this.x != 0 || this.y != 0) {
		// has there been a collision...?
		var collided = false;
		
		for (i = 0; i < scene.meshes.length; i++) {
			if (scene.meshes[i].hasOwnProperty('collideWith') && scene.meshes[i].collideWith == true) {
				// if i can collide with it, check against all of the ship's meshes
				for (j = 0; j < this.objects.length; j++) {
					if (scene.meshes[i].intersectsMesh(this.objects[j], true)) {
						// turn the origin box blue if it collides with something
						if (scene.meshes[i].hasOwnProperty('solid') && scene.meshes[i].solid == true) {
							this.collided();
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
}

PlayerShip.prototype.update = function() {
	// move the position of all objects the same way
	
	// rotate just the origin element
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
			this.currentSpeed += this.accelerationRate * this.currentThrustingDirection;
			
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
					this.movingRotation -= this.rotationThrustRate;
					if (this.movingRotation <= 0) {
						this.movingRotation = Math.PI * 2;
					}
				} else if (this.movingRotation <= (Math.PI * 2) && this.movingRotation >= (Math.PI * 2 - this.acuteTurnThreshold) && this.currentRotation >= 0 && this.currentRotation <= this.acuteTurnThreshold) {
					this.movingRotation += this.rotationThrustRate;
					if (this.movingRotation >= Math.PI * 2) {
						this.movingRotation = 0;
					}
				} else {
					if (this.currentRotation > this.movingRotation) {
						this.movingRotation += this.rotationThrustRate;
					} else if (this.currentRotation < this.movingRotation) {
						this.movingRotation -= this.rotationThrustRate;
					}
				}
				
				if (angleDiff < (Math.PI/2)) {
					this.currentSpeed += this.accelerationRate * this.currentThrustingDirection;
				} else {
					this.currentSpeed -= this.accelerationRate * this.currentThrustingDirection;
				}
				
			} else if (angleDiff > this.acuteTurnThreshold && angleDiff <= this.wideTurnThreshold) {
				// wide turn, medium
				
				//console.log('performing a WIDE turn');
				
				if (this.currentRotation <= (Math.PI * 2) && this.currentRotation >= (Math.PI * 2 - this.wideTurnThreshold) && this.movingRotation >= 0 && this.movingRotation <= this.wideTurnThreshold) {
					this.movingRotation -= this.rotationThrustRate * 0.5;
					if (this.movingRotation <= 0) {
						this.movingRotation = Math.PI * 2;
					}
				} else if (this.movingRotation <= (Math.PI * 2) && this.movingRotation >= (Math.PI * 2 - this.wideTurnThreshold) && this.currentRotation >= 0 && this.currentRotation <= this.wideTurnThreshold) {
					this.movingRotation += this.rotationThrustRate * 0.5;
					if (this.movingRotation >= Math.PI * 2) {
						this.movingRotation = 0;
					}
				} else {
					if (this.currentRotation > this.movingRotation) {
						this.movingRotation += this.rotationThrustRate * 0.5;
					} else if (this.currentRotation < this.movingRotation) {
						this.movingRotation -= this.rotationThrustRate * 0.5;
					}
				}
				
				if (angleDiff < (Math.PI/2)) {
					this.currentSpeed += (this.accelerationRate * 0.5) * this.currentThrustingDirection;
				} else {
					this.currentSpeed -= (this.accelerationRate * 0.5) * this.currentThrustingDirection;
				}
				
			} else {
				// full 180 turn, hard
				
				//console.log('performing a 180-DEGREE turn');
				
				if (this.currentSpeed > 0) { // slow down to 0 speed before continuing before continuing along the new angle
					this.currentSpeed -= (this.accelerationRate * 0.25) * this.currentThrustingDirection;
				} else if (currentSpeed < 0) { // speed up to 0 speed before continuing along the new angle
					this.currentSpeed += (this.accelerationRate * 0.25) * this.currentThrustingDirection;
				}
			}
			
		}
		
	} else if (this.movingRotation == this.currentRotation && this.currentlyThrusting) { // we are just moving straight ahead
		
		// just accelerate!
		//console.log('no turning, just accelerating');
		this.currentSpeed += this.accelerationRate * this.currentThrustingDirection;
		
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
	this.objects[0].position.x += Math.sin(this.movingRotation) * -this.currentSpeed;
	this.objects[0].position.y += Math.cos(this.movingRotation) * this.currentSpeed;
	
	// update our actual position
	this.x = this.objects[0].position.x;
	this.y = this.objects[0].position.y;
}
