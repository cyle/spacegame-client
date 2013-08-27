// debug info

var debug = document.getElementById("debug");
var debug_txt = '';

setInterval(function() {
	if (!gameIsReady) {
		debug.innerHTML = 'Game not ready.';
		return;
	}
	debug_txt = '';
	debug_txt += 'FPS: ' + BABYLON.Tools.GetFps().toPrecision(4) + '<br />';
	debug_txt += 'X: ' + prettyNum(playerShip.x, 2) + '<br />';
	debug_txt += 'Y: ' + prettyNum(playerShip.y, 2) + '<br />';
	//debug_txt += 'CamA: ' + prettyNum(camera.alpha, 2) + '<br />';
	//debug_txt += 'CamB: ' + prettyNum(camera.beta, 2) + '<br />';
	debug.innerHTML = debug_txt;
}, 100);