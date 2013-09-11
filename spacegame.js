// get where the socket.io server is
var socket_server_hostname = prompt('What\'s the hostname or IP of the server?', 'localhost');
while (socket_server_hostname == undefined || socket_server_hostname == '') {
	alert('You really need to connect to a server.');
	socket_server_hostname = prompt('What\'s the hostname or IP of the server?', 'localhost');
}
// ask for the player's name
var playerName = prompt('Your name?');
while (playerName == undefined || playerName == '') {
	alert('You really need to have a name.');
	playerName = prompt('Your name?');
}

// sounds
var canPlaySounds = false;
var blasterSound = null;
if (!createjs.Sound.initializeDefaultPlugins()) { console.log('Cannot load sound library!'); } // if initializeDefaultPlugins returns false, we cannot play sound in this browser
var audio_manifest = [
	{ id: 'blaster', src: 'audio/blaster.wav' }
];
 
createjs.Sound.addEventListener("loadComplete", handleAudioLoad);
createjs.Sound.registerManifest(audio_manifest);
 
function handleAudioLoad(event) {
	canPlaySounds = true;
	blasterSound = createjs.Sound.createInstance('blaster');
}

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

// this will eventually hold the "area" the player is inhabiting...
var area = {};

// create a fill light so we can see things
var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(45, -25, 30), scene);
//light.diffuse = new BABYLON.Color3(1, 1, 0);
light.diffuse = new BABYLON.Color3(1, 1, 1);
//light.specular = new BABYLON.Color3(1, 1, 1);
light.specular = new BABYLON.Color3(0, 0, 0);
light.intensity = 0.575;

// set up an X/Y/Z axis for reference...
var xBox = BABYLON.Mesh.CreateBox("zBox", 1.0, scene);
xBox.position = new BABYLON.Vector3(6, 5, 2);
xBox.material = new BABYLON.StandardMaterial("xBox-material", scene);
xBox.material.emissiveColor = new BABYLON.Color4(1, 0, 0, 1);
var yBox = BABYLON.Mesh.CreateBox("yBox", 1.0, scene);
yBox.position = new BABYLON.Vector3(5, 6, 2);
yBox.material = new BABYLON.StandardMaterial("yBox-material", scene);
yBox.material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
var zBox = BABYLON.Mesh.CreateBox("zBox", 1.0, scene);
zBox.position = new BABYLON.Vector3(5, 5, 3);
zBox.material = new BABYLON.StandardMaterial("zBox-material", scene);
zBox.material.emissiveColor = new BABYLON.Color4(0, 0, 1, 1);

var ruler = BABYLON.Mesh.CreatePlane("ruler", 1, scene);
ruler.position = new BABYLON.Vector3(2, 2, 0);
ruler.rotation.y = -Math.PI;
ruler.material = new BABYLON.StandardMaterial("ruler-material", scene);
ruler.material.diffuseTexture = new BABYLON.Texture("assets/ruler.png", scene);

// sphere: name, segments (detail), size, scene to add it to
// var sphere = BABYLON.Mesh.CreateSphere("Sphere", 9.0, 3.0, scene);
// sphere.position = new BABYLON.Vector3(15,0,0);
// sphere.collideWith = true;
// sphere.material = new BABYLON.StandardMaterial("texture", scene);
// sphere.material.wireframe = true;

// cylinder: name, height, diameter, segments (detail), scene to add it to, whether it's updatable
// var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 2, 2, 20, scene, false);
// cylinder.position = new BABYLON.Vector3(15,5,0);

// torus: name, diameter, thickness, segments (detail), scene to add it to, whether it's updatable
// var torus = BABYLON.Mesh.CreateTorus("torus", 5, 1, 20, scene, false);
// torus.position = new BABYLON.Vector3(15,10,0);

// import this spaceship mesh -- not sure what to do with it yet, but wanted to test importing
// BABYLON.SceneLoader.ImportMesh("", "models/Spaceship/", "Spaceship.babylon", scene, function (newMeshes, particleSystems) {
// 	//console.log(newMeshes);
// 	for (var i = 0; i < newMeshes.length; i++) {
// 		newMeshes[i].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
// 		newMeshes[i].position = new BABYLON.Vector3(0, 10, 0);
// 		newMeshes[i].rotation = new BABYLON.Vector3(Math.PI/4, 0, 0);
// 	}
// });

/*

	stuff to track

*/

// create an array to hold the bullet objects
var bullets = [];

// create an array to hold the salvage-able objects
var salvages = [];

/*

	load multiplayer stuff

*/

// this player's name
//var playerName = ''; // set earlier...
var playerShip = undefined;
var playerLast = { x: 0.0, y: 0.0, z: 0.0, angle: 0.0, direction: 0, state: 'normal' };

// create the list of other players
var players = [];

// open up a socket to the server
var socket = io.connect('http://'+socket_server_hostname+':31777', { 'reconnect': false }); // for now, don't bother reconnecting if the server goes down

socket.emit('connected', playerName);

socket.on('welcome', function(playerData) {
	//playerName = name;
	console.log('your player info retrieved from the database:');
	console.log(playerData);
	playerLast.x = playerData.x;
	playerLast.y = playerData.y;
	playerLast.angle = playerData.angle;
	// create the player ship
	playerShip = new PlayerShip(playerLast.x, playerLast.y, playerLast.angle, scene);
	//socket.emit('get-area', playerData.area);
	socket.emit('get-current-area');
});

socket.on('area-data', function(newArea) {
	console.log(newArea);
});

socket.on('current-area-data', function(newArea) {
	// take incoming area data
	
	//console.log('getting current area...');
	//console.log(newArea);
	
	area = newArea;
	
	// this flat plane acts as the "background" right now
	// flat plane: name, size of plane, scene to add it to
	var plane = BABYLON.Mesh.CreatePlane("background-plane", newArea.width, scene);
	plane.position = new BABYLON.Vector3(newArea.width/2, newArea.height/2, -8);
	plane.rotation.y = -Math.PI;
	plane.material = new BABYLON.StandardMaterial("bg-material", scene);
	plane.material.diffuseTexture = new BABYLON.Texture("assets/bg/stars.jpg", scene);
	plane.material.diffuseTexture.uScale = 6.0;
	plane.material.diffuseTexture.vScale = 6.0;
	
	// just create random crap in the background
	// so it's easier to tell when we're moving
	for (var i = 0; i < 200; i++) {
		var newcrap = BABYLON.Mesh.CreateSphere("crap-"+i, 3, 0.5, scene);
		newcrap.material = new BABYLON.StandardMaterial("crap-material", scene);
		newcrap.material.emissiveColor = new BABYLON.Color4(1, 1, 1, 1);
		newcrap.position.x = randomFromInterval(0, newArea.width);
		newcrap.position.y = randomFromInterval(0, newArea.height);
		newcrap.position.z = -4;
	}
	
	for (var i = 0; i < newArea.stuff.length; i++) {
		var thing = newArea.stuff[i];
		if (thing.type == 'asteroid') {
			var asteroid = undefined; // we will be defining it in a second...
			if (thing.model.type == 'sphere') {
				asteroid = BABYLON.Mesh.CreateSphere("asteroid-"+i, thing.model.seg, thing.model.size, scene);
				asteroid.material = new BABYLON.StandardMaterial("asteroid-material", scene);
				asteroid.material.emissiveColor = new BABYLON.Color4(thing.model.color.r, thing.model.color.g, thing.model.color.b, thing.model.color.a);
			} else if (thing.model.type == 'file') {
				// eventually handle it as a model file here...
			}
			asteroid.position = new BABYLON.Vector3(thing.x, thing.y, thing.z);
			asteroid.collideWith = true;
			asteroid.solid = true;
		} else if (thing.type == 'nebula') {
			var nebula = BABYLON.Mesh.CreateRect("nebula-"+i, thing.width, thing.height, thing.depth, scene);
			nebula.position = new BABYLON.Vector3(thing.x, thing.y, thing.z);
			nebula.collideWith = true;
			nebula.nebula = true;
			nebula.material = new BABYLON.StandardMaterial("nebula-texture", scene);
			nebula.material.emissiveColor = new BABYLON.Color4(0.5, 0.0, 0.5, 1);
			nebula.material.wireframe = true;
		} else if (thing.type == 'safezone') {
			var safezone = BABYLON.Mesh.CreateRect("safezone-"+i, thing.width, thing.height, thing.depth, scene);
			safezone.position = new BABYLON.Vector3(thing.x, thing.y, thing.z);
			safezone.collideWith = true;
			safezone.safeZone = true;
			safezone.material = new BABYLON.StandardMaterial("safezone-texture", scene);
			safezone.material.emissiveColor = new BABYLON.Color4(0, 1, 0, 1);
			safezone.material.wireframe = true;
		} else {
			console.log('unknown object in area: ');
			console.log(thing);
		}
	}
	
	//console.log('area built, game ready!');
	
	gameIsReady = true;
});

socket.on('otherPlayers', function(otherPlayers) {
	console.log(otherPlayers);
	for (var i = 0; i < otherPlayers.length; i++) {
		if (otherPlayers[i].name == playerName) {
			continue;
		}
		players.push( new OtherShip(otherPlayers[i].name, otherPlayers[i].x, otherPlayers[i].y, otherPlayers[i].angle, scene) );
	}
});

socket.on('updatePlayer', function(data) {
	// update when another player moves
	//console.log('player ' + data.name + ' moved!');
	for (var i = 0; i < players.length; i++) {
		if (players[i].name == data.name && players[i].done == false) {
			players[i].update(data.x, data.y, data.angle, data.thrustDirection);
			return; // done!
		}
	}
	// must be a new player -- add them
	console.log('a new player arrived: ' + data.name);
	players.push( new OtherShip(data.name, data.x, data.y, data.angle, scene) );
});

socket.on('removePlayer', function(name) {
	//console.log('a player left: ' + name);
	//console.log(data);
	for (var i = 0; i < players.length; i++) {
		if (players[i].name == name) {
			players[i].done = true;
		}
	}
});

socket.on('updateBullet', function(data) {
	// update bullet from server
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			bullets[i].update(data.x, data.y, data.angle);
			return;
		}
	}
	// must be a new bullet -- add it
	console.log('new bullet fired!');
	bullets.push( new Bullet( data.id, data.x, data.y, data.angle, scene ) );
});

socket.on('removeBullet', function(data) {
	// remove bullet
	// explode it?
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			bullets[i].done = true;
		}
	}
	if (data.didHit != false) {
		console.log('player ' + data.didHit.playerName + ' was hit!');
		// explosion!
		var explosionSprite = new BABYLON.Sprite('explosion', explosionSpriteManager);
		explosionSprite.position = new BABYLON.Vector3(data.didHit.x, data.didHit.y, 0);
		explosionSprite.size = 7;
		explosionSprite.playAnimation(0, 12, false, 50);
		if (data.didHit.playerName == playerName) {
			playerShip.damage( data.didHit.damage );
		}
	}
});

socket.on('newSalvage', function(data) {
	console.log('new salvage!');
	console.log(data);
	salvages.push( new Salvage( data.id, data.x, data.y, scene ) );
});

socket.on('removeSalvage', function(data) {
	console.log('remove salvage #' + data.id);
	for (var i = 0; i < salvages.length; i++) {
		if (salvages[i].id == data.id) {
			salvages[i].done = true;
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
	if (!gameIsReady) { return; }
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
	if (!gameIsReady) { return; }
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
		socket.emit('fired', { weaponType: 'test' });
		blasterSound.play();
		break;
		default:
		//console.log('key released: ' + e.keyCode);
	}
});

/*

	the pre-render update loop

*/

var explosionSpriteManager = new BABYLON.SpriteManager('testSprites', 'assets/explosion.png', 500, 200, scene);

var boxdir = true; // keep track of the little box's state
var deltaTime = 0;

// this is the pre-render update() loop
scene.registerBeforeRender(function () {
	
	if (!gameIsReady) { return; }
	
	/*
	
		get the deltaTime between frames
	
	*/
	
	deltaTime = BABYLON.Tools.GetDeltaTime()/1000; // divide by 1000 to get per second
	if (deltaTime > 0.25) { // this makes deltaTime stick to above 4fps
		deltaTime = 0.25;
	} else if (deltaTime < 0.01) { // this makes deltaTime stick to below 100fps
		deltaTime = 0.01;
	}
	
	//console.log('this frames deltaTime is: ' + deltaTime);
	
	// check to see if any of the other ships have left
	for (var i = 0; i < players.length; i++) {
		if (players[i].done == true) {
			players[i].dispose();
			players.splice(i, 1);
		}
	}
	
	// go through the bullets, see if any should be deleted
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].done == true) {
			bullets[i].dispose();
			bullets.splice(i, 1); // remove from the array of bullets
		}
	}
	
	// go through the salvage objects, see if any should be deleted
	for (var i = 0; i < salvages.length; i++) {
		if (salvages[i].done == true) {
			salvages[i].dispose();
			salvages.splice(i, 1); // remove from the array of salvages
		}
	}
	
	/*
	
		updating the player ship
	
	*/
	
	// ship rotation
	if (rotateLeft && !rotateRight) { // rotate left
		playerShip.rotate(-1, deltaTime);
	} else if (!rotateLeft && rotateRight) { // rotate right
		playerShip.rotate(1, deltaTime);
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
		playerShip.brake(deltaTime);
	}
	
	playerShip.update(deltaTime); // ok, update the player's ship position
	
	// keep the player ship within the area's X bounds
	if (playerShip.x > area.width) {
		playerShip.x = area.width;
		playerShip.collided(deltaTime); // ok, update the player's ship position
	} else if (playerShip.x < 0) {
		playerShip.x = 0;
		playerShip.collided(deltaTime); // ok, update the player's ship position
	}
	
	// keep the player within the area's Y bounds
	if (playerShip.y > area.height) {
		playerShip.y = area.height;
		playerShip.collided(deltaTime); // ok, update the player's ship position
	} else if (playerShip.y < 0) {
		playerShip.y = 0;
		playerShip.collided(deltaTime); // ok, update the player's ship position
	}
	
	playerShip.checkCollisions(scene, deltaTime); // check for collisions, update the ship appropriately
	
	// the camera needs to stay fixed on the player ship
	camera.target.x = playerShip.x;
	camera.target.y = playerShip.y;
	
	// let the server know our current stuff
	if (playerLast.x != playerShip.x || playerLast.y != playerShip.y || playerLast.z != playerShip.z || playerLast.angle != playerShip.currentRotation) {
		socket.emit('move', { x: playerShip.x, y: playerShip.y, angle: playerShip.currentRotation, direction: playerShip.currentThrustingDirection, state: playerShip.playerState });
		playerLast.x = playerShip.x;
		playerLast.y = playerShip.y;
		playerLast.z = playerShip.z;
		playerLast.angle = playerShip.currentRotation;
		playerLast.state = playerShip.playerState;
	}
		
});

/*

	actually render the scene, now that it's been updated

*/

engine.runRenderLoop(function() {
	if (!gameIsReady) { return; }
	scene.render(); // render it!
});

// handle window resize
window.addEventListener("resize", function() {
	engine.resize(); // resize the engine accordingly
});