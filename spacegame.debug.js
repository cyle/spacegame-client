// debug info
setInterval(function() {
	var debug = document.getElementById("debug");
	debug_txt = '';
	debug_txt += 'FPS: ' + BABYLON.Tools.GetFps().toPrecision(4) + '<br />';
	debug_txt += 'X: ' + prettyNum(playerShip.x) + '<br />';
	debug_txt += 'Y: ' + prettyNum(playerShip.y) + '<br />';
	debug_txt += 'mR: ' + prettyNum(playerShip.movingRotation) + '<br />';
	debug_txt += 'cR: ' + prettyNum(playerShip.currentRotation) + '<br />';
	debug_txt += 'S: ' + prettyNum(playerShip.currentSpeed) + '<br />';
	debug_txt += 'CamA: ' + prettyNum(camera.alpha) + '<br />';
	debug_txt += 'CamB: ' + prettyNum(camera.beta) + '<br />';
	debug.innerHTML = debug_txt;
}, 100);