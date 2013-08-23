BABYLON.Mesh.CreateRect = function (name, xSize, ySize, zSize, scene, updatable) {
    var box = new BABYLON.Mesh.CreateBox(name, 1.0, scene, updatable);
	box.scaling.x = xSize;
	box.scaling.y = ySize;
	box.scaling.z = zSize;
    return box;
};