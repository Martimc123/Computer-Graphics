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
var space_texture = new THREE.TextureLoader().load("https://wallpaperaccess.com/full/1268183.jpg");

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
	}
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
		"https://st2.depositphotos.com/5171687/44380/i/450/depositphotos_443805316-stock-photo-equirectangular-map-clouds-storms-earth.jpg"
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
	addRocketTop(rocket, 0, 0, -rocketPartHeight/2);
	addRocketBottom(rocket, 0, 0, rocketPartHeight/2);
	addRocketBooster(rocket, 0, rocketInfRadius-boosterRadius, rocketPartHeight+0.5*boosterHeight);
	addRocketBooster(rocket, 0, -rocketInfRadius+boosterRadius,rocketPartHeight+0.5*boosterHeight);
	addRocketBooster(rocket, rocketInfRadius-boosterRadius, 0, rocketPartHeight+0.5*boosterHeight);
	addRocketBooster(rocket, -rocketInfRadius+boosterRadius, 0, rocketPartHeight+0.5*boosterHeight);
	rocket.position.set(x, y, z);
	obj.add(rocket);
	return rocket;
}

function addRocketTop(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(rocketMidRadius, rocketSupRadius, rocketPartHeight, 41,1);
	addObjPart(obj, geometry, null, 0xff0000, x, y, z, Math.PI/180*90, 0, 0);
}

function addRocketBottom(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(rocketInfRadius, rocketMidRadius, rocketPartHeight, 41,1);
	addObjPart(obj, geometry, null, 0x000fff, x, y, z, Math.PI/180*90, 0, 0);
}

function addRocketBooster(obj, x, y, z) {
	geometry = new THREE.CapsuleGeometry(boosterRadius, boosterHeight, 0.5, 20);
	addObjPart(obj, geometry, null, 0xff0000, x, y, z, Math.PI/180*90, 0, 0);
}

function addTrash(x, y, z) {

}


function render() {
	renderer.render(scene, camera[currentCamera]); // tells 3js renderer to draw scene visualization based on camera 
}

function onResize() {
	var i;
	var val = 2;
	aspectRatio = window.innerWidth / window.innerHeight;
	renderer.setSize(window.innerWidth, window.innerHeight);
	var nrCameras = camera.length;
	for (var i = 0; i < nrCameras; i++) {
		camera[i].left = -viewSize * aspectRatio / val;
		camera[i].right = viewSize * aspectRatio / val;
		camera[i].top = viewSize / val;
		camera[i].bottom = viewSize / -val;
		camera[i].updateProjectionMatrix();
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

	if (rightArrow || leftArrow || upArrow || downArrow) { // rocket movement flags
		var rocketTheta = objAngles[0].x;
		var rocketPhi = objAngles[0].y;	
		var rocketX, rocketY, rocketZ;
		
		if (rightArrow){	
			rocketPhi += rocketSpeed * timeOccurred;
		}
		if (leftArrow){
			rocketPhi += - rocketSpeed * timeOccurred;
		}
		if (upArrow){
			rocketTheta += rocketSpeed * timeOccurred;
		}
		if (downArrow){
			rocketTheta += - rocketSpeed * timeOccurred;
		}
		
		rocketX = rocketTrashDistance * Math.sin(rocketTheta) * Math.sin(rocketPhi);
		rocketY = rocketTrashDistance * Math.cos(rocketTheta);
		rocketZ = rocketTrashDistance * Math.sin(rocketTheta) * Math.cos(rocketPhi);
		
		rocket.position.set(rocketX, rocketY, rocketZ);
		objAngles[0].set(rocketTheta, rocketPhi);
		objPositions[0].set(rocketX, rocketY, rocketZ);
	}
}

function animate() {
	update();
	requestAnimationFrame(animate);
	render();
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

	var val = 2;
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
	camera[0] = createOrtographicCamera(viewSize, 0, 0);
	camera[1] = createPerspectiveCamera(viewSize/2, viewSize/2, viewSize/2);
	camera[2] = createPerspectiveCamera(0, rocketInfRadius*2.5, rocketPartHeight*3);
	rocket.add(camera[2]);
	
	animate();
	video.addEventListener("playing", function() {
		copyVideo = true;
	  }, true);
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}
