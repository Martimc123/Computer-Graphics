// To generate the images, the videos and the overall project:
//  1. Run the command "python -m http.server" on a terminal in the index.html folder
//  2. Search for the url "localhost:8000" in a browser
// It may take a few seconds to load (about a minute, in the first try).
// For the Ubuntu wsl terminal, use "python -m SimpleHTTPServer 8000" instead

/*global THREE*/
var camera = [];
var scene, renderer, currentCamera = 0;

var viewSize = 40;
var aspectRatio;

var geometry, material, mesh;
var wiredObjects = [];

var leftArrow, rightArrow, upArrow, downArrow;
var clock = new THREE.Clock();

var defaultScale = 1;
var planetRadius = 12;
var rocketHeight = planetRadius/12;
var rocketPartHeight = rocketHeight/2;
var rocketInfRadius = rocketPartHeight;
var rocketMidRadius = rocketPartHeight/2;
var rocketSupRadius = 0;
var boosterRadius = rocketInfRadius/5;
var boosterHeight = rocketInfRadius/4;
var rocketTrashDistance = 1.2 * planetRadius;
var objPositions = [];
var objAngles = [];
var nrTrash = 20;
var markedTrash = [];
var trashLen = planetRadius/24;
var trashRadius = trashLen/2;
var rocketBoundaryRadius = Math.sqrt((rocketPartHeight+boosterHeight)**2 + rocketInfRadius**2);
var quadrants = [[],[],[],[],[],[],[],[],[]]; // case in border of quadrants goes to 9

var copyVideo;
var universe;
var planet;
var rocket;
var trash;
var rotate = false;
var loader = new THREE.TextureLoader();
var space_texture = new THREE.TextureLoader().load("./media/space.jpg");

var compressed_trash_texture = new THREE.TextureLoader().load("./media/trash.jpg");

const video = document.getElementById("video");
video.onloadeddata = function () {
	video.play();
};

const videoTexture = new THREE.VideoTexture(video);
	  videoTexture.needsUpdate = true;

'use strict';

function addObjPart(obj, geometry, mater, hex, x, y, z, rotX, rotY, rotZ,tag = "") {

	material = (mater != null)? mater : new THREE.MeshBasicMaterial({color: hex, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	obj.add(mesh);
	wiredObjects.push(mesh);
	return mesh;
}

function getObjPositions() {
	var i;
	var nrObj = nrTrash+1;
	var angleTheta, anglePhi;
	var objX, objY, objZ;

	for (i = 0; i < nrObj; i++) {
		var posVector = new THREE.Vector3(0,0,0); // spherical coordinates vector
		var angleVector = new THREE.Vector2(0,0); // angles Theta and Phi for spherical coordinates
		angleTheta = Math.random() * 2*Math.PI;
		anglePhi = Math.random() * 2*Math.PI;
		angleVector.set(angleTheta, anglePhi);
		objAngles.push(angleVector);

		objX = rocketTrashDistance * Math.sin(angleTheta) * Math.sin(anglePhi);
		objY = rocketTrashDistance * Math.cos(angleTheta);
		objZ = rocketTrashDistance * Math.sin(angleTheta) * Math.cos(anglePhi);
		posVector.set(objX, objY, objZ);	
		objPositions.push(posVector);
	}
	
}

function createUniverse(x, y, z, scale) {
	wires = true;
	universe = new THREE.Object3D();
	universe.scale.set(scale, scale, scale);
	var rocketPos = objPositions[0];
	trash = new THREE.Object3D();

	addPlanet(universe, 0, 0, 0);
	addRocket(universe, rocketPos.x, rocketPos.y, rocketPos.z);
	rocket.lookAt(scene.position);

	universe.add(trash);
	generateTrash(trash);

	createMesh(universe,'square');

	universe.position.set(x, y, z);
	scene.add(universe);
	return universe;
}

function hasColision(obj1,obj2)
{
	radius = (obj1.radius+obj2.radius)**2;
	distance = (obj1.center.x-obj2.center.x)**2 + (obj1.center.y-obj2.center.y)**2 + (obj1.center.z-obj2.center.z)**2;
	return radius >= distance;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function generateTrash(obj)
{
	var nrObj = nrTrash+1;
	for (i = 1;i<nrObj;i++)
	{
		var option = getRndInteger(1,4);
		if (option == 1)
		{
			cubic_trash = new THREE.Object3D();
			geometry = new THREE.BoxGeometry(trashLen, trashLen, trashLen);
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(cubic_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundary(cubic_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z, Math.sqrt(2*trashRadius**2));
			cubic_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),Math.sqrt(2*trashRadius**2));
			cubic_trash.name = "trash"+i;
			quadrants[quadrantIdentifier(objPositions[i].x,objPositions[i].y,objPositions[i].z)-1].push(cubic_trash);
			obj.add(cubic_trash);
		}
		if (option == 2)
		{
			polyhedron_trash = new THREE.Object3D();
			geometry = new THREE.DodecahedronGeometry(trashRadius,0);
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(polyhedron_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundary(polyhedron_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z,trashRadius);
			polyhedron_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),trashRadius);
			polyhedron_trash.name = "trash"+i;
			quadrants[quadrantIdentifier(objPositions[i].x,objPositions[i].y,objPositions[i].z)-1].push(polyhedron_trash);
			obj.add(polyhedron_trash);
		}
		if (option == 3)
		{
			cone_trash = new THREE.Object3D();
			geometry = new THREE.ConeGeometry(trashRadius, 2*trashRadius, 11 );
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(cone_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundary(cone_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z,Math.sqrt(2*trashRadius**2));
			cone_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),Math.sqrt(2*trashRadius**2));
			cone_trash.name = "trash"+i;
			quadrants[quadrantIdentifier(objPositions[i].x,objPositions[i].y,objPositions[i].z)-1].push(cone_trash);
			obj.add(cone_trash);
		}
	}
}

function checkCollisions()
{
	var i = quadrantIdentifier(objPositions[0].x,objPositions[0].y,objPositions[0].z)-1;
	quadrants[i].forEach( object => { 
		if (hasColision(rocket.getObjectByName("bb").geometry.boundingSphere,object.getObjectByName("bb").geometry.boundingSphere))
		{
			markedTrash.push(object);
		}
	});
}

function removeTrash()
{
	for (var i = 0; markedTrash.length; i++)
	{
		trash.remove(markedTrash[i]);
		markedTrash.splice(0,i);
	}
}

function quadrantIdentifier(x,y,z)
{
	if (x>0,y>0,z>0)
		return 1;

	else if(x>0,y<0,z>0)
		return 2;

	else if(x<0,y>0,z>0)
		return 3;

	else if(x<0,y>0,z>0)
		return 4;

	else if(x>0,y>0,z<0)
		return 5;

	else if(x>0,y<0,z<0)
		return 6;

	else if (x<0,y>0,z<0)
		return 7;
	else if(x<0,y<0,z<0)
		return 8;
	
	else
		return 9;
}

function addPlanet(obj, x, y, z) {
	planet = new THREE.Object3D();
	geometry = new THREE.SphereGeometry(planetRadius);
	
	var planetTexture = new THREE.TextureLoader().load("./media/earth2.jpg");
	var planetMaterial = new THREE.MeshBasicMaterial( {
		map: planetTexture,
		transparent:true,
		side:THREE.DoubleSide,
		} );

	addObjPart(obj, geometry, planetMaterial, 0x0000ff, x, y, z, 0, 0, 0);
}

function addRocket(obj, x, y, z) {
	rocket = new THREE.Object3D();
	addRocketTop(rocket, 0, rocketPartHeight/2, 0);
	addRocketBottom(rocket, 0, -rocketPartHeight/2, 0);
	addRocketBooster(rocket, rocketInfRadius-boosterRadius, -rocketPartHeight-0.5*boosterHeight, 0);
	addRocketBooster(rocket, -rocketInfRadius+boosterRadius, -rocketPartHeight-0.5*boosterHeight, 0);
	addRocketBooster(rocket, 0,-rocketPartHeight-0.5*boosterHeight, rocketInfRadius-boosterRadius);
	addRocketBooster(rocket, 0,-rocketPartHeight-0.5*boosterHeight, -rocketInfRadius+boosterRadius);
	addBoundary(rocket,0, 0, 0, rocketBoundaryRadius);
	rocket.rotation.z = -Math.PI/180 * 90;
	rocket.position.set(x, y, z);
	obj.add(rocket);
	return rocket;
}


function addBoundary(obj,x,y,z,radius)
{
	geometry = new THREE.SphereGeometry(radius);
	geometry.boundingSphere = new THREE.Sphere(radius);
	geometry.boundingSphere.center = new THREE.Vector3(x,y,z);
	geometry.boundingSphere.radius = radius;
	material = {};
	addObjPart(obj, geometry, material, 0xffff00, x,y,z, 0,0,0,"bb");
}

function addRocketTop(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(rocketSupRadius, rocketMidRadius, rocketPartHeight, 41,1);
	addObjPart(obj, geometry, null, 0xff0000, x, y, z, 0, 0, 0);
}

function addRocketBottom(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(rocketMidRadius, rocketInfRadius, rocketPartHeight, 41,1);
	addObjPart(obj, geometry, null, 0x000fff, x, y, z, 0, 0, 0);
}

function addRocketBooster(obj, x, y, z) {
	geometry = new THREE.CapsuleGeometry(boosterRadius, boosterHeight, 0.5, 20);
	addObjPart(obj, geometry, null, 0xff0000, x, y, z, 0, 0, 0);
}



function render() {
	renderer.render(scene, camera[currentCamera]); // tells 3js renderer to draw scene visualization based on camera 
}

function onResize() {
	if (window.innerWidth > 0 &&  window.innerHeight > 0){
		var i;
		var val = 2;
		aspectRatio = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth, window.innerHeight);
		var nrCameras = camera.length;
		for (i = 0; i < 1; i++) { // Ortographic Cameras
			camera[i].left = -viewSize * aspectRatio / val;
			camera[i].right = viewSize * aspectRatio / val;
			camera[i].top = viewSize / val;
			camera[i].bottom = viewSize / -val;
			camera[i].updateProjectionMatrix();
		}
		for (i=1; i < nrCameras; i++) { // Perspective cameras
			camera[i].aspect = aspectRatio;
			camera[i].updateProjectionMatrix();
		}
	}
}

function changeWires(wires) {
	var nrObj = wiredObjects.length;
	var i;
	for (i = 0; i < nrObj; i++) {
		wiredObjects[i].material.wireframe = wires;
	}
}

function update()
{
	var timeOccurred = clock.getDelta();
	var rocketSpeed = Math.PI/180 * 40;
	var degreesTraveled = rocketSpeed*timeOccurred;
	var dirLatitudeCoef = -1;
	var dirLongitudeCoef = -1;

	if (rightArrow || leftArrow || upArrow || downArrow) { // rocket movement flags
		var rocketTheta = objAngles[0].x;
		var rocketPhi = objAngles[0].y;	
		var rocketX, rocketY, rocketZ;
		var rotZ;
		
		// Nullifies opposite direction arrows for simplicity
		if (leftArrow && rightArrow) {
			leftArrow=false;
			rightArrow = false;
		}
		if (upArrow && downArrow) {
			upArrow = false;
			downArrow = false;
		}

		if (leftArrow && upArrow) {
			rotZ = -Math.PI/4;
			rocketPhi += dirLongitudeCoef * Math.sqrt(0.5)*degreesTraveled;
			rocketTheta += dirLatitudeCoef * Math.sqrt(0.5)*degreesTraveled;
		}
		else if (leftArrow && downArrow) {
			rotZ = -3*Math.PI/4;
			rocketPhi += dirLongitudeCoef * Math.sqrt(0.5)*degreesTraveled;
			rocketTheta += - dirLatitudeCoef * Math.sqrt(0.5)*degreesTraveled;
		}
		else if (rightArrow && upArrow) {
			rotZ = Math.PI/4;
			rocketPhi += -dirLongitudeCoef * Math.sqrt(0.5)*degreesTraveled;
			rocketTheta += dirLatitudeCoef * Math.sqrt(0.5)*degreesTraveled;
		}
		else if (rightArrow && downArrow) {
			rotZ = 3*Math.PI/4;
			rocketPhi += -dirLongitudeCoef * Math.sqrt(0.5)*degreesTraveled;
			rocketTheta += - dirLatitudeCoef * Math.sqrt(0.5)*degreesTraveled;
		}
		else if (leftArrow) {
			rotate=true;
			rotZ = -Math.PI/2;
			rocketPhi += dirLongitudeCoef * degreesTraveled;
		}
		else if (rightArrow) {
			rotate=true;
			rotZ = Math.PI/2;
			rocketPhi += -dirLongitudeCoef * degreesTraveled;
		}
		else if (upArrow) {
			rotate=false;
			rotZ = 0;
			rocketTheta += dirLatitudeCoef * degreesTraveled;
		}
		else if (downArrow) {
			rotate=false;
			rotZ = Math.PI;
			rocketTheta += - dirLatitudeCoef * degreesTraveled;
		}
		
		rocketX = rocketTrashDistance * Math.sin(rocketTheta) * Math.sin(rocketPhi);
		rocketY = rocketTrashDistance * Math.cos(rocketTheta);
		rocketZ = rocketTrashDistance * Math.sin(rocketTheta) * Math.cos(rocketPhi);
		
		rocket.position.set(rocketX, rocketY, rocketZ);
		rocket.lookAt(scene.position);
		if (rotate)
			rocket.rotateZ(Math.PI/180 * 90);
		objAngles[0].set(rocketTheta, rocketPhi);
		objPositions[0].set(rocketX, rocketY, rocketZ);
		rocket.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(rocketX, rocketY, rocketZ),rocketBoundaryRadius);
		checkCollisions();
	}
}

function display() {
	changeWires(wires);
	removeTrash();
	requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function createMesh(obj,name)
{
	universe = new THREE.Object3D();
	universe.scale.set(1,1,1);

	let shape = new THREE.Shape();
	let width, height,radius,x,y;
	const pos = new THREE.Vector3();
	let rot=0;
	const extrudeSettings = {
		depth: 8,
		bevelEnabled: true,
		bevelSegments: 2,
		steps: 2,
		bevelSize: 1,
		bevelThickness: 1
	}
	switch(name)
	{
		case 'square':
		width = 80;
		shape.moveTo(0,0);
		shape.lineTo(0,width);
		shape.lineTo(width,width);
		shape.lineTo(width,0);
		shape.lineTo(0,0);
		pos.x=-40;
		pos.y=-40;
		break;
	}
	let geometry;
	geometry = new THREE.ExtrudeBufferGeometry(shape,extrudeSettings);
	mesh = new THREE.Mesh(geometry,material);
	mesh.position.copy(pos);
	mesh.rotation.z = rot;
	obj.add(mesh);
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	scene.background = videoTexture;//space_texture;
	getObjPositions();
	universe = createUniverse(0, 0, 0, defaultScale);
}

function createOrtographicCamera(x, y, z) {

	var val = 2;
	aspectRatio = window.innerWidth / window.innerHeight;
	var camera = new THREE.OrthographicCamera( viewSize * aspectRatio/-val, 
																					viewSize * aspectRatio / val, 
																					viewSize / val, 
																					viewSize / -val, 
																					1, 
																					1000);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	
	camera.lookAt(scene.position);
	
	return camera;
}

function createPerspectiveCamera(x, y, z) {
	aspectRatio = window.innerWidth / window.innerHeight;
	var camera = new THREE.PerspectiveCamera(70,
																					aspectRatio,
																					1,
																					1000);
	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	
	camera.lookAt(scene.position);
	
	return camera;
}

function onKeyDown(e) {
	var keyName = e.keyCode;
	switch (keyName) {
		case 49://1
			currentCamera = 0;
			break;
		case 50://2
			currentCamera = 1;
			break;
		case 51://3
			currentCamera = 2;
			break;
			
		case 52://4
			wires = !wires;
			break;
	
		case 37 : // left arrow key
			leftArrow = true;
			break;
		case 38: // up arrow key
			upArrow = true;
			break;
		case 39: // right arrow key
			rightArrow = true;
			break;
		case 40: // down arrow key
			downArrow = true;
			break;
		default:
			break;
	}
}

function onKeyUp(e) {
	var keyName = e.keyCode;
	switch (keyName) {
		case 37 : // left arrow key
			leftArrow = false;
			break;
		case 38: // up arrow key
			upArrow = false;
			break;
		case 39: // right arrow key
			rightArrow = false;
			break;
		case 40: // down arrow key
			downArrow = false;
			break;
		default:
			break;
	}
}


function init() {
		
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	createScene();
	camera[0] = createOrtographicCamera(0, 0, viewSize);
	camera[1] = createPerspectiveCamera(viewSize/2, viewSize/2, viewSize/2);
	camera[2] = createPerspectiveCamera(0, -rocketInfRadius*2.5, -rocketPartHeight*3);
	rocket.add(camera[2]);
	rocket.add(new THREE.AxesHelper(10));
	animate();
	video.addEventListener("playing", function() {
		copyVideo = true;
	  }, true);
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}