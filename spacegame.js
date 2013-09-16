
// the gameIsReady variable is defined earlier than this file...

var playerName = undefined; // none set yet
var socket = undefined; // this will hold the socket.io connection

document.getElementById('login-server').focus();

var login_btn = document.getElementById('game-start-btn');
login_btn.addEventListener('click', function() {
	// on login, check for server hostname and username
	var login_server = document.getElementById('login-server').value;
	var login_username = document.getElementById('login-username').value;
	
	if (login_server == undefined || login_server == '') {
		alert('You really need to connect to a server.');
		document.getElementById('login-server').focus();
		return;
	}
	
	if (login_username == undefined || login_username == '') {
		alert('You really need to have a name.');
		document.getElementById('login-username').focus();
		return;
	}
	
	// remove the login screen, it's no longer needed
	document.getElementById('login').parentNode.removeChild(document.getElementById('login'));
	
	playerName = login_username;
	
	// connect to socket.io based game server
	socket = io.connect('http://'+login_server+':31777', { 'reconnect': false }); // for now, don't bother reconnecting if the server goes down
	
	// ok, now line up all of the socket responders
	
	// respond to event when the server has found us after first connecting
	socket.on('welcome', welcome);
	
	// respond to event when the server has sent along area data you've asked for
	socket.on('area-data', areaData);
	
	// respond to event when the server has sent along the area data for where you currently are
	socket.on('current-area-data', currentAreaData);
	
	// respond to event when the server has sent along what other players are in your zone/area
	socket.on('otherPlayers', otherPlayers);
	
	// update other players' positions and whatnot based on the server -- or create them if they don't exist on this client yet
	socket.on('updatePlayer', updatePlayer);
	
	// remove another player
	socket.on('removePlayer', removePlayer);
	
	// update a bullet's position based on the server -- or create one if it doesn't exist yet
	socket.on('updateBullet', updateBullet);
	
	// remove a bullet, and show explosion/damage if needed
	socket.on('removeBullet', removeBullet);
	
	// create new salvage-able object somewhere in the zone
	socket.on('newSalvage', newSalvage);

	// remove salvage-able object from the zone
	socket.on('removeSalvage', removeSalvage);

	// respond to when the server tells us we've successfully salvaged an object
	socket.on('salvaged', salvaged);
	
	// repond to when the server tells us we've successfully initiated a subspace jump
	socket.on('area-jump-result', areaJumpResult);
	
	// update your position if the server tells you to
	socket.on('update-position', updatePosition);
	
	// let the server know you're connected and loaded up
	socket.emit('connected', playerName); 
	
});

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
var scene = undefined; // load the BABYLON scene, where all meshes will live
var camera = undefined; // we will use this once we start building our area

/*

	stuff to track

*/

// the player ship object (very important)
var playerShip = undefined;

// the player's last known position and state
var playerLast = { x: 0.0, y: 0.0, z: 0.0, angle: 0.0, direction: 0, state: 'normal' };

// this will eventually hold the "area" the player is inhabiting
var area = {};

// create an array to hold the bullet objects
var bullets = [];

// create an array to hold the salvage-able objects
var salvages = [];

// these will hold the sprite managers
var explosionSpriteManager = undefined;
var bulletSpriteManager = undefined;

/*

	load multiplayer stuff

*/

// create the list of other players
var players = [];

// this function builds the area/zone we're in, dumping any old one we left
function buildArea() {
	
	// disable the gameIsReady state
	gameIsReady = false;
	
	console.log('building area...');
	
	// dump the other players
	//console.log('clearing players array');
	players = [];
	
	// dump the current area, if there even is one yet
	if (scene) {
		//console.log('disposing of current scene');
		scene.dispose();
	}
	
	// new scene
	//console.log('creating new scene');
	scene = new BABYLON.Scene(engine);
	
	// the player camera will be constrained, allowing a top-down view of the player's ship
	// arc camera: name, alpha (angle, in radians), beta (another angle, in radians), radius (how far away initially), pointing at, scene to add it to
	//console.log('creating camera');
	camera = new BABYLON.ArcRotateCamera("Camera", Math.PI/2, Math.PI/2, 50, new BABYLON.Vector3(0, 0, 0), scene);
	// constrain the camera
	camera.lowerRadiusLimit = 10;
	camera.upperRadiusLimit = 75;
	camera.lowerAlphaLimit = Math.PI * 0.33;
	camera.upperAlphaLimit = Math.PI * 0.66;
	camera.lowerBetaLimit = Math.PI * 0.33;
	camera.upperBetaLimit = Math.PI * 0.66;

	// attach the camera to the scene
	//console.log('attaching camera to scene');
	scene.activeCamera.attachControl(canvas);

	// create a fill light so we can see things
	//console.log('creating light');
	var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(45, -25, 30), scene);
	//light.diffuse = new BABYLON.Color3(1, 1, 0);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	//light.specular = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(0, 0, 0);
	light.intensity = 0.575;
	
	// this flat plane acts as the "background" right now
	// flat plane: name, size of plane, scene to add it to
	//console.log('creating background');
	var plane = BABYLON.Mesh.CreatePlane("background-plane", area.width, scene);
	plane.position = new BABYLON.Vector3(area.width/2, area.height/2, -8);
	plane.rotation.y = -Math.PI;
	plane.material = new BABYLON.StandardMaterial("bg-material", scene);
	plane.material.diffuseTexture = new BABYLON.Texture("assets/bg/stars.jpg", scene);
	plane.material.diffuseTexture.uScale = 6.0;
	plane.material.diffuseTexture.vScale = 6.0;
	
	// just create random crap in the background
	// so it's easier to tell when we're moving
	//console.log('creating random background crap');
	for (var i = 0; i < 200; i++) {
		var newcrap = BABYLON.Mesh.CreateSphere("crap-"+i, 3, 0.5, scene);
		newcrap.material = new BABYLON.StandardMaterial("crap-material", scene);
		newcrap.material.emissiveColor = new BABYLON.Color4(1, 1, 1, 1);
		newcrap.position.x = randomFromInterval(0, area.width);
		newcrap.position.y = randomFromInterval(0, area.height);
		newcrap.position.z = -4;
	}
	
	//console.log('building the current area');
	for (var i = 0; i < area.stuff.length; i++) {
		var thing = area.stuff[i];
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
	
	// initialize sprite managers to current scene
	explosionSpriteManager = new BABYLON.SpriteManager('testSprites', 'assets/explosion.png', 10, 200, scene);
	bulletSpriteManager = new BABYLON.SpriteManager('bulletSprites', 'assets/blaster.png', 25, 10, scene);
	
	// create the player ship in this scene
	playerShip = new PlayerShip(playerLast.x, playerLast.y, playerLast.angle, scene);
	
	// register game loop
	scene.registerBeforeRender(theGameLoop);
	
	// get the extra info about the area, i.e. other players, salvages, etc
	socket.emit('get-current-area-extra');
	
	// ok -- game is ready now
	gameIsReady = true;
	
}

function welcome(playerData) {
	console.log('your player info retrieved from the database:');
	console.log(playerData);
	playerLast.x = playerData.x;
	playerLast.y = playerData.y;
	playerLast.angle = playerData.angle;
	socket.emit('get-current-area'); // get whatever current area we're in
}

function areaData(newArea) {
	console.log(newArea);
}

function currentAreaData(newArea) {
	// take incoming area data
	console.log('getting current area...');
	//console.log(newArea);
	area = newArea;
	buildArea();
	console.log('current area built, game ready!');
}

function otherPlayers(otherPlayers) {
	console.log('receiving other players in area:');
	console.log(otherPlayers);
	for (var i = 0; i < otherPlayers.length; i++) {
		if (otherPlayers[i].name == playerName) {
			continue;
		}
		players.push( new OtherShip(otherPlayers[i].name, otherPlayers[i].x, otherPlayers[i].y, otherPlayers[i].angle, scene) );
	}
}

function updatePlayer(data) {
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
}

function removePlayer(name) {
	console.log('a player left: ' + name);
	//console.log(data);
	for (var i = 0; i < players.length; i++) {
		if (players[i].name == name) {
			players[i].done = true;
		}
	}
}

function updateBullet(data) {
	// update bullet from server
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			bullets[i].update(data.x, data.y, data.angle);
			return;
		}
	}
	// must be a new bullet -- add it
	//console.log('new bullet fired!');
	bullets.push( new Bullet( data.id, data.x, data.y, data.angle, scene, bulletSpriteManager ) );
}

function removeBullet(data) {
	// remove bullet
	// explode it?
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			bullets[i].done = true;
		}
	}
	if (data.didHit != false) {
		//console.log('player ' + data.didHit.playerName + ' was hit!');
		// explosion!
		var explosionSprite = new BABYLON.Sprite('explosion', explosionSpriteManager);
		explosionSprite.position = new BABYLON.Vector3(data.didHit.x, data.didHit.y, 0);
		explosionSprite.size = 7;
		explosionSprite.disposeWhenFinishedAnimating = true;
		explosionSprite.playAnimation(0, 12, false, 50);
		if (data.didHit.playerName == playerName) {
			playerShip.damage( data.didHit.damage );
		}
	}
}

function newSalvage(data) {
	//console.log('new salvage!');
	//console.log(data);
	salvages.push( new Salvage( data.id, data.x, data.y, scene ) );
}

function removeSalvage(data) {
	//console.log('remove salvage #' + data.id);
	for (var i = 0; i < salvages.length; i++) {
		if (salvages[i].id == data.id) {
			salvages[i].done = true;
		}
	}
}

function salvaged(data) {
	console.log('salvaged!');
	console.log(data);
}

function areaJumpResult(data) {
	// this happens when you try to jump...
	console.log('jump request succeeded...');
	//console.log(data);
	if (data.x != undefined) {
		playerLast.x = playerShip.x = data.x;
	}
	if (data.y != undefined) {
		playerLast.y = playerShip.y = data.y;
	}
	area = data.newArea;
	buildArea();
}

function updatePosition(data) {
	if (data.x != undefined) {
		playerShip.x = data.x;
	}
	if (data.y != undefined) {
		playerShip.y = data.y;
	}
}

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
		case 81: // q
		console.log('trying to salvage!');
		socket.emit('salvage');
		break;
		case 74: // j
		console.log('trying to subspace jump!');
		var jump_to_area_name = prompt('Jump to where?');
		socket.emit('area-jump', { name: jump_to_area_name });
		break;
		default:
		//console.log('key released: ' + e.keyCode);
	}
});

/*

	the pre-render update loop

*/

var deltaTime = 0;

// this is the pre-render update() loop
function theGameLoop() {
	
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
		
}

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