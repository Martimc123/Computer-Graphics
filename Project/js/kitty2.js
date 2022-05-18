/*global THREE*/

var camera = [];
var scene, renderer, currentCamera = 0;

var viewSize = 50;
var aspectRatio;

var geometry, material, mesh;

var kitty;
var wires;
var defaultScale = 1;

var qKey,wKey,aKey,sKey,dKey,cKey,zKey,xKey;
var leftArrow, rightArrow, upArrow, downArrow;
var clock = new THREE.Clock();

//var controls;

'use strict';

// change to receive position, yes, but also body radius and height
function createKitty(x, y, z, scale) {
		
	wires = true;
	kitty = new THREE.Object3D();
	kitty.scale.set(scale,scale,scale);
	// change for positions to be based on cylinder height and angle
	addKittyTorso(kitty, "torso", 0, 0, 0); // based on kitty origin position
	var head = new THREE.Object3D();
	addKittyFace(head, "face", 5, 4, 0);
	addKittyEye(head, "eye1", 7, 3.5, -1);
	addKittyEye(head, "eye2", 7, 3.5, 1);
	addKittyEar(head, "ear1", 5, 6, 2, Math.PI / 180 * 45);
	addKittyEar(head, "ear2", 5, 6, -2, Math.PI / 180 * -45);
	addKittyNose(head, "nose", 7.5, 3, 0);
	addKittyWhisker(head, "whisker1", 8, 3, 1);
	addKittyWhisker(head, "whisker2", 8, 2.5, 1);
	addKittyWhisker(head, "whisker3", 8, 3, -1);
	addKittyWhisker(head, "whisker4", 8, 2.5, -1);
	head.name="head";
	kitty.add(head);
	
	var legs = new THREE.Object3D();
	addKittyLeg(legs, "leg1", -3, -4, -1);
	addKittyLeg(legs, "leg2", -3, -4, 1);
	addKittyLeg(legs, "leg3", 1, -4, 1);
	addKittyLeg(legs, "leg4", 1, -4, -1);
	legs.name="legs";
	kitty.add(legs);
		
	addKittyTail(kitty, "tail", -6, 3, 0);
	
	kitty.position.set(x, y, z);

	scene.add(kitty);
	return kitty;
}

function addKittyPart(obj, tag, geometry, hex, x, y, z, rotX, rotY, rotZ) {
	material = new THREE.MeshBasicMaterial({ color: hex, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	obj.add(mesh);
	return mesh;
}

function addKittyWhisker(obj, tag, x, y, z) {
	geometry = new THREE.BoxGeometry(0.25, 1, 0.25, 1, 1, 1);
	addKittyPart(obj, tag, geometry, 0x5b0001, x, y, z, Math.PI/180 * 90, 0, 0);
}

function addKittyNose(obj, tag, x, y, z) {
	geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5, 1, 1, 1);
	addKittyPart(obj, tag, geometry, 0xef64bc, x, y, z, 0, 0, 0);
}

function addKittyTail(obj, tag, x, y, z) {
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 4, 1);
	addKittyPart(obj, tag, geometry, 0x9B26B6, x, y, z, 0, 0, Math.PI / 180 * 45);
}

function addKittyTorso(obj, tag, x, y, z) {
	geometry = new THREE.CylinderGeometry(2, 2, 8, 20, 1);
	addKittyPart(obj, tag, geometry, 0x35e8df, x, y, z, 0, 0, Math.PI / 180 * 90);
}

function addKittyFace(obj, tag, x, y, z) {
	geometry = new THREE.SphereGeometry(2);
	addKittyPart(obj, tag, geometry, 0xfde995, x, y, z, 0, 0, 0);
}

function addKittyEye(obj, tag, x, y, z) {
	geometry = new THREE.SphereGeometry(0.25, 4, 4);
	addKittyPart(obj, tag, geometry, 0x49b517, x, y, z, 0, 0, 0);
}

function addKittyLeg(obj, tag, x, y, z) {
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 8, 1);
	addKittyPart(obj, tag, geometry, 0xf2a007, x, y, z, 0, 0, 0);
}

function addKittyEar(obj, tag, x, y, z, rotX) {
	geometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
	addKittyPart(obj, tag, geometry, 0xffffff, x, y, z, rotX, 0, 0);
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


function changeWires(wires)
{
	kitty.getObjectByName("torso").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("face").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("nose").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("eye1").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("eye2").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("whisker1").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("whisker2").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("whisker3").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("whisker4").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("ear1").material.wireframe = wires;
	kitty.getObjectByName("head").getObjectByName("ear2").material.wireframe = wires;
	kitty.getObjectByName("tail").material.wireframe = wires;
	kitty.getObjectByName("legs").getObjectByName("leg1").material.wireframe = wires;
	kitty.getObjectByName("legs").getObjectByName("leg2").material.wireframe = wires;
	kitty.getObjectByName("legs").getObjectByName("leg3").material.wireframe = wires;
	kitty.getObjectByName("legs").getObjectByName("leg4").material.wireframe = wires;
}

function update(){
	changeWires(wires);
	var timeOccurred = clock.getDelta();
	var maxHeadRotation = Math.PI/35;
	var minHeadRotation = -Math.PI/35;
	var bodyMovSpeed = 1.5;
	var bodyRotSpeed = 1.5;
	var headRotSpeed = 0.5;
	var earRotSpeed = 1.5;
	
	if (qKey)
		kitty.rotation.y += bodyRotSpeed * timeOccurred;
	if (wKey)
		kitty.rotation.y += - bodyRotSpeed * timeOccurred;
	if (aKey){
		var head = kitty.getObjectByName("head");
		if (head.rotation.z < maxHeadRotation)
			head.rotation.z += headRotSpeed * timeOccurred;
	}
	if (sKey){
		var head = kitty.getObjectByName("head");
		if(head.rotation.z > minHeadRotation)
			head.rotation.z += - headRotSpeed * timeOccurred;
	}
	if (zKey){
		var ear1 = kitty.getObjectByName("head").getObjectByName("ear1");
		ear1.rotation.z += earRotSpeed * timeOccurred;
	}
	if (xKey) {
		var ear1 = kitty.getObjectByName("head").getObjectByName("ear1");
		ear1.rotation.z += - earRotSpeed * timeOccurred;
	}
	if (dKey)
		kitty.translateX(bodyMovSpeed * timeOccurred);
	if (cKey)
		kitty.translateX(- bodyMovSpeed * timeOccurred);
	if (upArrow)
		kitty.translateY(bodyMovSpeed * timeOccurred);
	if (downArrow)
		kitty.translateY(- bodyMovSpeed * timeOccurred);
	if (leftArrow)
		kitty.translateZ(bodyMovSpeed * timeOccurred);
	if (rightArrow)
		kitty.translateZ(- bodyMovSpeed * timeOccurred);

	console.log(kitty.position.x, kitty.position.y, kitty.position.z);
}

function onKeyDown(e) {
	var keyName = e.keyCode;
	console.log(keyName);
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

		case 65: //A
		case 97: //a
			aKey = true;
			break;
		case 83: //S
		case 115: //s
			sKey = true;
			break;
		case 81: //Q
		case 113: //q
			qKey = true;
			break;
		case 87: //W
		case 119: //w
			wKey = true;
			break;					
		case 90: //Z
		case 122: //z
			zKey = true;
			break;
		case 88: //X
		case 120: //x
			xKey = true;
			break;
		case 68: //D
		case 100: //d
			dKey = true;
			break;
		case 67: //C
		case 99: //c
			cKey = true;
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

		case 65: //A
		case 97: //a
			aKey = false;
			console.log("hi A bitch");
			console.log(aKey);
			break;
		case 83: //S
		case 115: //s
			sKey = false;
			break;
		case 81: //Q
		case 113: //q
			qKey = false;
			break;
		case 87: //W
		case 119: //w
			wKey = false;
			break;					
		case 90: //Z
		case 122: //z
			zKey = false;
			break;
		case 88: //X
		case 120: //x
			xKey = false;
			break;
		case 68: //D
		case 100: //d
			dKey = false;
			break;
		case 67: //C
		case 99: //c
			cKey = false;
			break;
		default:
			break;
	}
}

function animate() {
	update();
	requestAnimationFrame(animate);
//	controls.update();
	render();
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	kitty = createKitty(0, 0, 0, defaultScale);
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

function init() {
		
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	createScene();
	camera[0] = createCamera(20, 0, 0);
	camera[1] = createCamera(0, 20, 0);
	camera[2] = createCamera(0, 0, 20);
	pivot = new THREE.Group();

	scene.add(pivot);
	pivot.add(kitty);

	animate();

	//  controls = new THREE.OrbitControls( camera[currentCamera], renderer.domElement );
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}