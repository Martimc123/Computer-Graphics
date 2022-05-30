/*global THREE*/
var camera = [];
var scene, renderer, currentCamera = 0;

var viewSize = 40;
var aspectRatio;

var geometry, material, mesh;
var wiredObjects = [];

var leftArrow, rightArrow, upArrow, downArrow;
var clock = new THREE.Clock();

var controls;

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
var floatingTrash = [];
var trashSizes = [];
var minTrashSize = planetRadius/24;
var maxTrashSize = planetRadius/20;
var trashGeometries = [];

var copyVideo;
var universe;
var planet;
var rocket;
var loader = new THREE.TextureLoader();
var space_texture = new THREE.TextureLoader().load(
	//"https://wallpaperaccess.com/full/1268183.jpg"
	"./media/space.jpg"
	);

const video = document.getElementById("video");
video.onloadeddata = function () {
	video.play();
};

const videoTexture = new THREE.VideoTexture(video);
	  videoTexture.needsUpdate = true;

'use strict';

function addObjPart(obj, geometry, mater, hex, x, y, z, rotX, rotY, rotZ) {

	material = (mater != null)? mater : new THREE.MeshBasicMaterial({color: hex, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
	mesh.position.set(x, y, z);
	obj.add(mesh);
	wiredObjects.push(mesh);
	return mesh;
}

function getObjPositions() {
	var i;
	var nrObj = nrTrash+1;
	var angleTheta, anglePhi;
	var objX, objY, objZ;
	var posVector = new THREE.Vector3(0,0,0); // spherical coordinates vector
	var angleVector = new THREE.Vector2(0,0); // angles Theta and Phi for spherical coordinates

	for (i = 0; i < nrObj; i++) {
		angleTheta = Math.random() * 2*Math.PI;
		anglePhi = Math.random() * 2*Math.PI;
		angleVector.set(angleTheta, anglePhi);
		objAngles.push(angleVector);

		objX = rocketTrashDistance * Math.sin(angleTheta) * Math.sin(anglePhi);
		objY = rocketTrashDistance * Math.cos(angleTheta);
		objZ = rocketTrashDistance * Math.sin(angleTheta) * Math.cos(anglePhi);
		posVector.set(objX, objY, objZ);	
		objPositions.push(posVector);
	}/*
	objAngles[0].set(0, Math.PI/2);
	objPositions[0].set(0,rocketTrashDistance,0);
	*/
}

function createUniverse(x, y, z, scale) {
	wires = true;
	universe = new THREE.Object3D();
	universe.scale.set(scale, scale, scale);
	var rocketPos = objPositions[0];

	addPlanet(universe, 0, 0, 0);
	addRocket(universe, rocketPos.x, rocketPos.y, rocketPos.z);
	addAux(universe);

	universe.position.set(x, y, z);
	scene.add(universe);
	return universe;
}

function addPlanet(obj, x, y, z) {
	planet = new THREE.Object3D();
	geometry = new THREE.SphereGeometry(planetRadius);
	
	var planetTexture = new THREE.TextureLoader().load(
		"./media/earth.jpg"
		//"https://st2.depositphotos.com/5171687/44380/i/450/depositphotos_443805316-stock-photo-equirectangular-map-clouds-storms-earth.jpg"
		);
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
	rocket.rotation.z = -Math.PI/180 * 90;
	rocket.position.set(x, y, z);
	obj.add(rocket);
	return rocket;
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

function addTrash(x, y, z) {

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
	controls.update();
	var timeOccurred = clock.getDelta();
	var rocketSpeed = Math.PI/180 * 40;
	var directionRot = Math.PI/180 * 90;
	var wholeRotation = 2*Math.PI;

	if (rightArrow || leftArrow || upArrow || downArrow) { // rocket movement flags
		var rocketTheta = objAngles[0].x;
		var rocketPhi = objAngles[0].y;	
		var rocketX, rocketY, rocketZ;
		
		if (leftArrow){	
			rocketPhi += rocketSpeed * timeOccurred;
			rotZ = directionRot;
		}
		if (rightArrow){
			rocketPhi += - rocketSpeed * timeOccurred;
			rotZ = -directionRot;
		}
		if (upArrow){
			rocketTheta += rocketSpeed * timeOccurred;
			rotX = directionRot;
		}
		if (downArrow){
			rocketTheta += - rocketSpeed * timeOccurred;
			rotX = -directionRot;
		}
		
		rocketX = rocketTrashDistance * Math.sin(rocketTheta) * Math.sin(rocketPhi);
		rocketY = rocketTrashDistance * Math.cos(rocketTheta);
		rocketZ = rocketTrashDistance * Math.sin(rocketTheta) * Math.cos(rocketPhi);
		
		rocket.position.set(rocketX, rocketY, rocketZ);
		rocket.lookAt(scene.position);
		objAngles[0].set(rocketTheta, rocketPhi);
		objPositions[0].set(rocketX, rocketY, rocketZ);
	/*	console.log("pos:[" + rocket.position.x + "," 
							+ rocket.position.y + ", "
							+ rocket.position.z + "]");
	*/	console.log("angles:[theta(lat):" + rocketTheta%wholeRotation + ", phi(long):" + rocketPhi%wholeRotation + "]");
	}
}

function display() {
	changeWires(wires);
	requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function addAux(obj) {
	geometry = new THREE.SphereGeometry(5);
	addObjPart(obj, geometry, null, 0xffc0cb, 15, 0, 0);
	addObjPart(obj, geometry, null, 0xffff00, 15, 0, 0);
	addObjPart(obj, geometry, null, 0x0000ff, 15, 0, 0);
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	scene.background = space_texture;
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
		case 53: //5
			currentCamera = 3;
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
	camera[3] = createOrtographicCamera(0, 0, viewSize);
	rocket.add(camera[2]);
	rocket.add(new THREE.AxesHelper(10));
	controls = new THREE.OrbitControls(camera[3], renderer.domElement);
	animate();
	video.addEventListener("playing", function() {
		copyVideo = true;
	  }, true);
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}
