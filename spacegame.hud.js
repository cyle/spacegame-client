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
}, 100);