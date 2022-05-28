/*global THREE*/
var camera = [];
var scene, renderer, currentCamera = 0;

var viewSize = 50;
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
var rocketSpin;
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

function createUniverse(x, y, z, scale) {
	wires = true;
	universe = new THREE.Object3D();
	universe.scale.set(scale, scale, scale);

	addPlanet(universe, 0, 0, 0);
	addRocket(universe, 0, rocketTrashDistance, 0);

	rocketGroup = new THREE.Group();
	scene.add(rocketGroup);
	rocketGroup.add(rocket);

	universe.position.set(x, y, z);
	scene.add(universe);
	return universe;
}

function addPlanet(obj, x, y, z) {
	planet = new THREE.Object3D();
	geometry = new THREE.SphereBufferGeometry(planetRadius);
	
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
	var rocketSpeed = 2.5;
	var axis = new THREE.Vector3(0,0,0);
	
	/*
	if (rightArrow){
		rocket.rotateOnWorldAxis(axis, - rocketSpeed * timeOccurred);
	}
	if (leftArrow){
		rocket.rotateOnWorldAxis(axis, rocketSpeed * timeOccurred);
	} 
*/

	if (rightArrow){
		rocketGroup.rotation.x += - rocketSpeed * timeOccurred;
	}
	if (leftArrow){
		rocketGroup.rotation.x += rocketSpeed * timeOccurred;
	}
	if (upArrow){
		rocketGroup.rotation.z += - rocketSpeed * timeOccurred;
	}
	if (downArrow){
		rocketGroup.rotation.z += rocketSpeed * timeOccurred;
	}
}

function animate() {
	update();
	requestAnimationFrame(animate);
	render();
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	scene.background = space_texture;
	universe = createUniverse(0, 0, 0, defaultScale);
}

function createCamera(x, y, z) {

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
	camera[0] = createCamera(viewSize, 0, 0);
	camera[1] = createCamera(0, viewSize, 0);
	camera[2] = createCamera(0, 0, viewSize);

	animate();
	video.addEventListener("playing", function() {
		copyVideo = true;
	  }, true);
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}
