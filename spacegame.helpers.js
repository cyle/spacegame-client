/*

	spacegame helper functions / things

*/

function degreesToRadians(degrees) {
	return degrees * (Math.PI/180);
}

function randomFromInterval(from, to) {
    return Math.floor(Math.random() * (to-from+1) + from);
}

function prettyNum(num) {
	return Math.round(num * 100)/100;
}