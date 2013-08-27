/*

	spacegame helper functions / things

*/

function degreesToRadians(degrees) {
	return degrees * (Math.PI/180);
}

function radiansToDegrees(radians) {
	return radians * (180/Math.PI);
}

function randomFromInterval(from, to) {
    return Math.floor(Math.random() * (to-from+1) + from);
}

function prettyNum(num, decimals) {
	var size = Math.pow(10, decimals);
	return Math.round(num * size)/size;
}