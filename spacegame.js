// the canvas element is where the magic happens
var canvas = document.getElementById("render");
var engine = new BABYLON.Engine(canvas, true); // load the BABYLON engine
var scene = new BABYLON.Scene(engine); // load the BABYLON scene, where all meshes will live

// the player camera will be constrained, allowing a top-down view of the player's ship
// arc camera: name, alpha (angle, in radians), beta (another angle, in radians), radius (how far away initially), pointing at, scene to add it to
var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI/2, Math.PI/2, 50, new BABYLON.Vector3(0, 0, 0), scene);
// constrain the camera
camera.lowerRadiusLimit = 10;
camera.upperRadiusLimit = 75;
camera.lowerAlphaLimit = Math.PI * 0.33;
camera.upperAlphaLimit = Math.PI * 0.66;
camera.lowerBetaLimit = Math.PI * 0.33;
camera.upperBetaLimit = Math.PI * 0.66;

// attach the camera to the scene
scene.activeCamera.attachControl(canvas);

// create a fill light so we can see things
var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(45, -25, 30), scene);
light.diffuse = new BABYLON.Color3(1, 1, 0);
light.specular = new BABYLON.Color3(1, 1, 1);
light.intensity = 0.575;



/*

	here's a bunch of primitives to add to the scene
	  just to test out what they look like and how they work

*/


// these boxes are just weird examples of animation later on
// box: name, size of box, scene to add it to
var box = BABYLON.Mesh.CreateBox("Box", 4.0, scene);
box.position = new BABYLON.Vector3(-25,0,0);
box.rotation.x = Math.PI/3;
box.rotation.y = -Math.PI/3;
box.rotation.z = Math.PI/5;
// create a littler box, which will interact with the big box
var box2 = BABYLON.Mesh.CreateBox("Box2", 3.0, scene);
box2.parent = box;
box2.position.y = 10;
box2.material = new BABYLON.StandardMaterial("box2-material", scene);

// set up an X/Y/Z axis for reference...
var xBox = BABYLON.Mesh.CreateBox("zBox", 1.0, scene);
xBox.position = new BABYLON.Vector3(1, 0, 0);
xBox.material = new BABYLON.StandardMaterial("xBox-material", scene);
xBox.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
var yBox = BABYLON.Mesh.CreateBox("yBox", 1.0, scene);
yBox.position = new BABYLON.Vector3(0, 1, 0);
yBox.material = new BABYLON.StandardMaterial("yBox-material", scene);
yBox.material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
var zBox = BABYLON.Mesh.CreateBox("zBox", 1.0, scene);
zBox.position = new BABYLON.Vector3(0, 0, 1);
zBox.material = new BABYLON.StandardMaterial("zBox-material", scene);
zBox.material.emissiveColor = new BABYLON.Color4(0, 0, 1, 1);

// this flat plane acts as the "background" right now
// flat plane: name, size of plane, scene to add it to
var plane = BABYLON.Mesh.CreatePlane("Plane", 200.0, scene);
plane.position = new BABYLON.Vector3(0, 0, -8);
plane.rotation.y = -Math.PI;

var ruler = BABYLON.Mesh.CreatePlane("ruler", 1, scene);
ruler.position = new BABYLON.Vector3(2, 2, 0);
ruler.rotation.y = -Math.PI;
ruler.material = new BABYLON.StandardMaterial("ruler-material", scene);
ruler.material.diffuseTexture = new BABYLON.Texture("assets/ruler.png", scene);

// sphere: name, segments (detail), size, scene to add it to
var sphere = BABYLON.Mesh.CreateSphere("Sphere", 9.0, 3.0, scene);
sphere.position = new BABYLON.Vector3(15,0,0);
sphere.collideWith = true;
sphere.material = new BABYLON.StandardMaterial("texture", scene);
sphere.material.wireframe = true;

// cylinder: name, height, diameter, segments (detail), scene to add it to, whether it's updatable
var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 2, 2, 20, scene, false);
cylinder.position = new BABYLON.Vector3(15,5,0);

// torus: name, diameter, thickness, segments (detail), scene to add it to, whether it's updatable
var torus = BABYLON.Mesh.CreateTorus("torus", 5, 1, 20, scene, false);
torus.position = new BABYLON.Vector3(15,10,0);



/*

	okay, these are some actual game element objects

*/

// make a "safe box", used later
// the idea is that inside a safe zone, a ship is invulnerable but weaponless
var safebox = BABYLON.Mesh.CreateRect("Safe Zone", 10, 20, 3, scene);
safebox.position = new BABYLON.Vector3(-15,15,0);
safebox.collideWith = true;
safebox.safeZone = true;
safebox.material = new BABYLON.StandardMaterial("texture", scene);
safebox.material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
safebox.material.wireframe = true;

// make a "nebula box", used later
// the idea is that inside a nebula, a ship is invisible
var nebulabox = BABYLON.Mesh.CreateRect("Nebula", 10, 20, 3, scene);
nebulabox.position = new BABYLON.Vector3(-15,-15,0);
nebulabox.collideWith = true;
nebulabox.nebula = true;
nebulabox.material = new BABYLON.StandardMaterial("texture", scene);
nebulabox.material.emissiveColor = new BABYLON.Color4(0.5, 0.0, 0.5, 1);
nebulabox.material.wireframe = true;

// just create random crap in the background
// so it's easier to tell when we're moving
for (i = 0; i < 200; i++) {
	var newcrap = BABYLON.Mesh.CreateSphere("crap-"+i, 3, 0.5, scene);
	newcrap.material = new BABYLON.StandardMaterial("crap-material", scene);
	newcrap.material.emissiveColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
	newcrap.position.x = randomFromInterval(-100, 100);
	newcrap.position.y = randomFromInterval(-100, 100);
	newcrap.position.z = -4;
}

// add some random asteroids
/*
for (i = 0; i < 100; i++) {
	var asteroid = BABYLON.Mesh.CreateSphere("asteroid-"+i, 3, 1, scene);
	asteroid.material = new BABYLON.StandardMaterial("asteroid-material", scene);
	asteroid.material.emissiveColor = new BABYLON.Color4(0.6, 0.3, 0, 1);
	asteroid.position.x = randomFromInterval(-100, 100);
	asteroid.position.y = randomFromInterval(-100, 100);
	asteroid.collideWith = true;
	asteroid.solid = true;
}
*/

// import this spaceship mesh -- not sure what to do with it yet, but wanted to test importing
BABYLON.SceneLoader.ImportMesh("", "models/Spaceship/", "Spaceship.babylon", scene, function (newMeshes, particleSystems) {
	//console.log(newMeshes);
	for (i = 0; i < newMeshes.length; i++) {
		newMeshes[i].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
		newMeshes[i].position = new BABYLON.Vector3(0, 10, 0);
		newMeshes[i].rotation = new BABYLON.Vector3(Math.PI/4, 0, 0);
	}
});

// add an asteroid field
var asteroidFieldX = 50; // the center X pos of the field
var asteroidFieldY = 50; // the center Y pos of the field
for (i = 0; i < 100; i++) {
	var asteroidField = BABYLON.Mesh.CreateSphere("asteroid-field-"+i, 3, 1, scene);
	asteroidField.material = new BABYLON.StandardMaterial("asteroid-material", scene);
	asteroidField.material.emissiveColor = new BABYLON.Color4(0.6, 0.3, 0, 1);
	asteroidField.position.x = asteroidFieldX + randomFromInterval(-20, 20);
	asteroidField.position.y = asteroidFieldY + randomFromInterval(-20, 20);
	asteroidField.collideWith = true;
	asteroidField.solid = true;
}

// create the player ship
var playerShip = new PlayerShip(0, 0, scene);

// create an array to hold the bullet objects
var bullets = [];


/*

	load multiplayer stuff

*/

// this player's name
var playerName = '';

// create the list of other players
var players = [];

// open up a socket to the server
var socket = io.connect('http://localhost:31777');

socket.on('welcome', function(name) {
	playerName = name;
});

socket.on('otherPlayers', function(otherPlayers) {
	console.log(otherPlayers);
	for (i = 0; i < otherPlayers.length; i++) {
		if (otherPlayers[i].name == playerName) {
			continue;
		}
		players.push( new OtherShip(otherPlayers[i].name, otherPlayers[i].x, otherPlayers[i].y, otherPlayers[i].angle, scene) );
	}
});

socket.on('updatePlayer', function(data) {
	//console.log('a player moved!');
	//console.log(data);
	if (playerName == data.name) {
		return;
	}
	for (i = 0; i < players.length; i++) {
		if (players[i].name == data.name) {
			players[i].update(data.x, data.y, data.angle);
		}
	}
});

socket.on('newPlayer', function(data) {
	//console.log(data);
	// set up a new other player ship
	if (data.name == playerName) {
		return;
	}
	console.log('a new player arrived: ' + data.name);
	players.push( new OtherShip(data.name, data.x, data.y, data.angle, scene) );
});

socket.on('removePlayer', function(name) {
	console.log('a player left: ' + name);
	//console.log(data);
	for (i = 0; i < players.length; i++) {
		if (players[i].name == name) {
			players[i].dispose();
			players.splice(i, 1);
		}
	}
});

/*

	player controls and button-mashing state

*/

// these will hold the player control states, pretty self-explanatory
var moveForward = false;
var moveReverse = false;
var rotateLeft = false;
var rotateRight = false;
var brake = false;

// listen for keys going down, register them as player movement or whatever
// event.keyCode reference: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
window.addEventListener('keydown', function(e) {
	switch (e.keyCode) {
		case 87: // w
		moveForward = true;
		break;
		case 65: // a
		rotateLeft = true;
		break;
		case 68: // d
		rotateRight = true;
		break;
		case 83: // s
		moveReverse = true;
		break;
		case 16:
		brake = true;
		break;
		default:
		//console.log('key pressed: ' + e.keyCode);
	}
});

// register keys coming back up, register them as stopping movement, or whatever
window.addEventListener('keyup', function(e) {
	switch (e.keyCode) {
		case 87: // w
		moveForward = false;
		break;
		case 65: // a
		rotateLeft = false;
		break;
		case 68: // d
		rotateRight = false;
		break;
		case 83: // s
		moveReverse = false;
		break;
		case 16:
		brake = false;
		break;
		case 67: // c
		// this resets the camera to the "center"
		camera.alpha = Math.PI / 2;
		camera.beta = Math.PI / 2;
		break;
		case 77: // m
		// dump out a list of meshes for debugging
		console.log(scene.meshes);
		//console.log(playerShip.objects);
		break;
		case 32: // space bar
		// fire straight ahead!
		bullets.push( new Bullet( playerShip.x, playerShip.y, playerShip.currentRotation, scene ) );
		document.getElementById('blaster-sound').play(); // play the blaster sound!
		break;
		default:
		//console.log('key released: ' + e.keyCode);
	}
});

/*

	the pre-render update loop

*/

var boxdir = true; // keep track of the little box's state
var playerLast = { x: 0.0, y: 0.0, z: 0.0, angle: 0.0 };

// this is the pre-render update() loop
scene.registerBeforeRender(function () {
	
	// move the little box back and forth through the big box
	if (boxdir == true && box2.position.y > -10) {
		box2.position.y -= 0.1;
		if (box2.position.y <= -10) {
			boxdir = false;
		}
	} else if (box2.position.y < 10 && boxdir == false) {
		box2.position.y += 0.1;
		if (box2.position.y >= 10) {
			boxdir = true;
		}
	}
	
	// normal little box color:
	box2.material.emissiveColor = new BABYLON.Color4(0, 0, 0, 1);
	// if the box intersects with the bigger box, turn it red!
	if (box2.intersectsMesh(box, true)) {
		box2.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
	}
	
	/*
	
		updating the player ship
	
	*/
	
	// ship rotation
	if (rotateLeft && !rotateRight) { // rotate left
		playerShip.rotate(-1);
	} else if (!rotateLeft && rotateRight) { // rotate right
		playerShip.rotate(1);
	}
	
	// thrust forward / reverse
	if (moveForward || moveReverse) { // thrusting
		document.getElementById('thruster-sound').play(); // play the thruster sound
		if (moveForward && !moveReverse) { // thrust forward
			playerShip.setDirection(1);
		}
		if (!moveForward && moveReverse) { // thrust reverse
			playerShip.setDirection(-1);
		}
	} else {
		playerShip.setDirection(0); // not thrusting in any direction
		document.getElementById('thruster-sound').pause(); // stop the thruster sound
	}
	
	if (brake) { // if braking, slow down the player ship
		playerShip.brake();
	}
	
	playerShip.update(); // ok, update the player's ship position
		
	playerShip.checkCollisions(scene); // check for collisions, update the ship appropriately
	
	// go through the bullets, update their positions
	for (i = 0; i < bullets.length; i++) { 
		bullets[i].update(); // update!
		bullets[i].checkCollisions(scene); // check to see if the bullet hit anything
		if (bullets[i].done == true) {
			bullets[i].update(); // run its own cleanup
			bullets.splice(i, 1); // remove from the array of bullets
		}
	}
	
	// the camera needs to stay fixed on the player ship
	camera.target.x = playerShip.x;
	camera.target.y = playerShip.y;
	
	// let the server know our current stuff
	if (playerLast.x != playerShip.x || playerLast.y != playerShip.y || playerLast.z != playerShip.z || playerLast.angle != playerShip.currentRotation) {
		socket.emit('move', { x: playerShip.x, y: playerShip.y, angle: playerShip.currentRotation });
		playerLast.x = playerShip.x;
		playerLast.y = playerShip.y;
		playerLast.z = playerShip.z;
		playerLast.angle = playerShip.currentRotation;
	}
		
});

/*

	actually render the scene, now that it's been updated

*/

engine.runRenderLoop(function() {
	scene.render(); // render it!
});

// handle window resize
window.addEventListener("resize", function() {
	engine.resize(); // resize the engine accordingly
});

gameIsReady = true;