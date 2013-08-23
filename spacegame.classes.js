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
	
	var box = BABYLON.Mesh.CreateBox("TestBox-piece1", 2.0, scene);
	box.position = new BABYLON.Vector3(x + 0, y + 0, 0);
	
	var box2 = BABYLON.Mesh.CreateBox("TestBox-piece2", 1.0, scene);
	box2.position = new BABYLON.Vector3(x + 1, y - 1, 0);
	
	var box3 = BABYLON.Mesh.CreateBox("TestBox-piece3", 1.0, scene);
	box3.position = new BABYLON.Vector3(x - 1, y - 1, 0);
	
	this.objects.push(box);
	this.objects.push(box2);
	this.objects.push(box3);
	
}

TestObject.prototype.update = function() {
	// move the position of all objects the same way
	for (i = 0; i < this.objects.length; i++) {
		this.objects[i].position.x += 0; // don't move sideways
		this.objects[i].position.y += 0.01; // move slowly forward
	}
}

TestObject.prototype.draw = function() {
	
}



