var hud = document.getElementById("hud");
var hud_html = '';

setInterval(function() {
	if (!gameIsReady) {
		hud.innerHTML = 'Game not ready yet...';
		return;
	}
	
	hud_html = ''; // clear the hud for re-rendering
	
	hud_html += '<table>';
	hud_html += '<tr>';
	
	hud_html += '<td>'+playerName+'</td>';
	hud_html += '<td>'+prettyNum(radiansToDegrees(playerShip.currentRotation), 2)+'&deg; / '+prettyNum(radiansToDegrees(playerShip.movingRotation), 2)+'&deg;</td>';
	hud_html += '<td>'+prettyNum(playerShip.currentSpeed * 500, 2)+' m/s</td>';
	hud_html += '<td>0.0e / 10.0e</td>';
	hud_html += '<td>'+playerShip.hpCurrent+' / '+playerShip.hpMax+' hp</td>';
	
	hud_html += '</tr>';
	hud_html += '</table>';
	
	hud.innerHTML = hud_html;
	
	/*
	debug_txt = '';
	debug_txt += 'FPS: ' + BABYLON.Tools.GetFps().toPrecision(4) + '<br />';
	debug_txt += 'Name: ' + playerName + '<br />';
	debug_txt += 'X: ' + prettyNum(playerShip.x, 2) + '<br />';
	debug_txt += 'Y: ' + prettyNum(playerShip.y, 2) + '<br />';
	debug_txt += 'mR: ' + prettyNum(playerShip.movingRotation, 2) + '<br />';
	debug_txt += 'cR: ' + prettyNum(playerShip.currentRotation, 2) + '<br />';
	debug_txt += 'S: ' + prettyNum(playerShip.currentSpeed, 2) + '<br />';
	debug_txt += 'CamA: ' + prettyNum(camera.alpha, 2) + '<br />';
	debug_txt += 'CamB: ' + prettyNum(camera.beta, 2) + '<br />';
	debug.innerHTML = debug_txt;
	*/
}, 100);