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
var rocketHeight = planetRadius/11;
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
var trash;
var loader = new THREE.TextureLoader();
var space_texture = new THREE.TextureLoader().load(
	//"https://wallpaperaccess.com/full/1268183.jpg"
	"./media/space.jpg"
	);

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
	addAux(universe);

	universe.add(trash);
	GenerateTrash(universe,trash);

	/*geometry = new THREE.SphereGeometry( 2,552, 32, 12 );
	material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );

	yellow_ball = new THREE.Object3D();
	addObjPart(yellow_ball, geometry, material, 0xffff00, -1.8707498945048748,1.1172412046804643,-14.234186556413192, 0,0,0,"og");
	
	geometry = new THREE.SphereGeometry( 2,552, 32, 16);
	material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
	addObjPart(yellow_ball, geometry, material, 0xffff00, -1.8707498945048748,1.1172412046804643,-14.234186556413192, 0,0,0,"b1");
	universe.add(yellow_ball);
	yellow_ball.getObjectByName("b1").geometry.computeBoundingSphere();
	yellow_ball.getObjectByName("b1").position = new THREE.Vector3(-1.8707498945048748,1.1172412046804643,-14.234186556413192);*/

	universe.position.set(x, y, z);
	scene.add(universe);
	return universe;
}

function HasColision(obj1,obj2)
{
	radius = (obj1.radius+obj2.radius)**2;
	distance = (obj1.center.x-obj2.center.x)**2 + (obj1.center.y-obj2.center.y)**2 + (obj1.center.z-obj2.center.z)**2;
	return radius >= distance;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function GenerateTrash(universe,obj)
{
	for (i = 1;i<21;i++)
	{
		var option = getRndInteger(1,4);
		//console.log("Option: "+option);
		if (option == 1)
		{
			cubic_trash = new THREE.Object3D();
			geometry = new THREE.BoxGeometry( planetRadius/21, planetRadius/21, planetRadius/21 );
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(cubic_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundaryBox(cubic_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z,(planetRadius/21));
			cubic_trash.getObjectByName("bb").geometry.computeBoundingSphere();
			cubic_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),1.5);
			cubic_trash.name = "trash"+i;
			obj.add(cubic_trash);
			floatingTrash.push(cubic_trash);
			universe.add(obj);
		}
		if (option == 2)
		{
			polyhedron_trash = new THREE.Object3D();
			geometry = new THREE.DodecahedronGeometry(planetRadius/21,0);
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(polyhedron_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundaryBox(polyhedron_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z,planetRadius/21+1);
			polyhedron_trash.getObjectByName("bb").geometry.computeBoundingSphere();
			polyhedron_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),1.5);
			polyhedron_trash.name = "trash"+i;
			obj.add(polyhedron_trash);
			floatingTrash.push(polyhedron_trash);
			universe.add(obj);
		}
		if (option == 3)
		{
			cone_trash = new THREE.Object3D();
			geometry = new THREE.ConeGeometry( planetRadius/21, 1, 11 );
			material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:true} );
			addObjPart(cone_trash, geometry, material, 0x00ff00, objPositions[i].x,objPositions[i].y,objPositions[i].z,0,0,0,tag = "");
			addBoundaryBox(cone_trash,objPositions[i].x,objPositions[i].y,objPositions[i].z,planetRadius/21+0.2);
			floatingTrash.push(cone_trash);
			cone_trash.getObjectByName("bb").geometry.computeBoundingSphere();
			cone_trash.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(objPositions[i].x,objPositions[i].y,objPositions[i].z),1.5);
			cone_trash.name = "trash"+i;
			obj.add(cone_trash);
			floatingTrash.push(cone_trash);
			universe.add(obj);
		}
	}
}

function checkCollisions()
{
	for(var i=0;i<21;i++)
	{	
		if (HasColision(rocket.getObjectByName("bb").geometry.boundingSphere,floatingTrash[i].getObjectByName("bb").geometry.boundingSphere))
		{
				console.log("COLISAO");
				trash.remove(floatingTrash[i]);
				//universe.remove(yellow_ball);
				//scene.remove(yellow_ball);
		}
	}
	//console.log(floatingTrash[i].getObjectByName("bb"));
}

function addPlanet(obj, x, y, z) {
	planet = new THREE.Object3D();
	geometry = new THREE.SphereGeometry(planetRadius);
	
	var planetTexture = new THREE.TextureLoader().load(
		"./media/earth2.jpg"
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
	addBoundaryBox(rocket,0, 0, rocketPartHeight/2,rocketHeight);
	rocket.rotation.z = -Math.PI/180 * 90;
	rocket.position.set(x, y, z);
	obj.add(rocket);
	return rocket;
}


function addBoundaryBox(obj,x,y,z,raio)
{
	geometry = new THREE.SphereGeometry(raio);
	geometry.computeBoundingSphere();
	material = {};//new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
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

function myLookAt(obj, targetPosition) {
	var targetPos = obj.worldToLocal(targetPosition.clone());
    var rotationAxis = new THREE.Vector3().crossVectors(
        new THREE.Vector3(0, 0, -1),
        targetPos
    ).normalize();
    var angle = new THREE.Vector3(0, 0, -1).angleTo(
        targetPos.normalize().clone());

    obj.rotateOnAxis(rotationAxis, angle);
}

function update()
{
	controls.update();
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
		
		if (leftArrow){	
			rocketPhi += dirLongitudeCoef * degreesTraveled;
			rotZ = -Math.PI/2;
		}
		if (rightArrow){
			rocketPhi += -dirLongitudeCoef * degreesTraveled;
			rotZ = Math.PI/2;
		}
		if (upArrow){
			rocketTheta += dirLatitudeCoef * degreesTraveled;
			rotZ = Math.PI;
		}
		if (downArrow){
			rocketTheta += - dirLatitudeCoef * degreesTraveled;
			rotZ = -Math.PI;
		}

		// If speed is in both directions, to mantain total, speed in each direction is halved
		if (leftArrow && upArrow) {
			rocketPhi += -dirLongitudeCoef * degreesTraveled /2;
			rocketTheta += -dirLatitudeCoef * degreesTraveled /2;
		}
		if (leftArrow && downArrow) {
			rocketPhi += -dirLongitudeCoef * degreesTraveled /2;
			rocketTheta += dirLatitudeCoef * degreesTraveled /2;
		}
		if (rightArrow && upArrow) {
			rocketPhi += dirLongitudeCoef * degreesTraveled /2;
			rocketTheta += -dirLatitudeCoef * degreesTraveled /2;
		}
		if (rightArrow && downArrow) {
			rocketPhi += dirLongitudeCoef * degreesTraveled /2;
			rocketTheta += dirLatitudeCoef * degreesTraveled /2;
		}
		
		rocketX = rocketTrashDistance * Math.sin(rocketTheta) * Math.sin(rocketPhi);
		rocketY = rocketTrashDistance * Math.cos(rocketTheta);
		rocketZ = rocketTrashDistance * Math.sin(rocketTheta) * Math.cos(rocketPhi);
		
		rocket.position.set(rocketX, rocketY, rocketZ);
		rocket.lookAt(scene.position);
		objAngles[0].set(rocketTheta, rocketPhi);
		objPositions[0].set(rocketX, rocketY, rocketZ);
		//yellow_ball.getObjectByName("b1").geometry.boundingSphere.set(new THREE.Vector3(-1.8707498945048748,1.1172412046804643,-14.234186556413192),1.5);
		rocket.getObjectByName("bb").geometry.boundingSphere.set(new THREE.Vector3(rocketX, rocketY, rocketZ),1.5);
		checkCollisions();
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
	controls = new THREE.OrbitControls(camera[currentCamera], renderer.domElement);
	animate();
	video.addEventListener("playing", function() {
		copyVideo = true;
	  }, true);
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}