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
var nrObj = nrTrash+1;
var floatingTrash = [];
var trashSize = planetRadius/24;
var trashGeometries = [];
var trashRadius = [];

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
		angleTheta = Math.random() * 2*Math.PI;
		anglePhi = Math.random() * 2*Math.PI;
		var angleVector = new THREE.Vector2(angleTheta, anglePhi); // angles Theta and Phi for spherical coordinates
		objAngles.push(angleVector);

		objX = rocketTrashDistance * Math.sin(angleTheta) * Math.sin(anglePhi);
		objY = rocketTrashDistance * Math.cos(angleTheta);
		objZ = rocketTrashDistance * Math.sin(angleTheta) * Math.cos(anglePhi);
		var posVector = new THREE.Vector3(objX, objY, objZ); // spherical coordinates vector
		objPositions.push(posVector);
	}
}

function getTrashGeometries() {
	var radius;
	
	geometry = new THREE.BoxGeometry(trashSize, trashSize, trashSize);
	radius = Math.sqrt(trashSize**2+trashSize**2);
	trashGeometries.push(geometry);
	trashRadius.push(radius);

	geometry = new THREE.DodecahedronGeometry(trashSize);
	radius = trashSize;
	trashGeometries.push(geometry);
	trashRadius.push(radius);

	geometry = new THREE.ConeGeometry(trashSize, 2*trashSize, 11);
	radius = Math.sqrt(trashSize**2+trashSize**2);
	trashGeometries.push(geometry);
	trashRadius.push(radius);
}

function createUniverse(x, y, z, scale) {
	wires = true;
	universe = new THREE.Object3D();
	universe.scale.set(scale, scale, scale);
	var rocketPos = objPositions[0];
	trash = new THREE.Object3D();

	addPlanet(universe, 0, 0, 0);
	addRocket(universe, rocketPos.x, rocketPos.y, rocketPos.z);

	universe.add(trash);
	trash.position.set(0,0,0);
	addTrash(trash);
	universe.position.set(x, y, z);
	scene.add(universe);
	return universe;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min+1)) + min;
}

function addTrash(obj) {
	var i;
	var nrObj = nrTrash+1;
	material = new THREE.MeshBasicMaterial( {map: compressed_trash_texture,transparent:false} );
	for (i=1; i < nrObj; i++) {
		var position = objPositions[i];
		var option = getRndInteger(0,2);
		console.log("geom=" +option);
		var trashUnit = new THREE.Object3D();
		geometry = trashGeometries[option];
		addObjPart(trashUnit, geometry, material, 0x00ff00, 0, 0, 0, 0, 0, 0);
		
		var radius = trashRadius[option];
		addBoundary(trashUnit, radius);
		trashUnit.getObjectByName("boundary").visible = false;

		trashUnit.name = "trash"+i;
		floatingTrash.push(trashUnit);
		obj.add(trashUnit);
		trashUnit.position.set(position.x, position.y, position.z);
	}
	var nr = objPositions.length;
	console.log(nr);
	var obj2 = objPositions[0];
	console.log("rocket:[" + obj2.x + ", " + obj2.y + "," + obj2.z + "]");
	
	for (i=1; i < nr; i++) {
		var obj2 = objPositions[i];
		console.log("trash:[" + obj2.x + ", " + obj2.y + "," + obj2.z + "]");
	}
	var nr = floatingTrash.length;
	console.log(nr);
	for (i=0; i < nr; i++) {
		var obj = floatingTrash[i];
		var obj2 = obj.position;
		console.log("trash:[" + obj2.x + ", " + obj2.y + "," + obj2.z + "]");
	}
}

function addBoundary(obj, radius) {
	geometry = new THREE.SphereGeometry(radius, 16, 8);
	material = new THREE.MeshBasicMaterial({wireframe: wires});
	addObjPart(obj, geometry, material, 0x000000, 0, 0, 0, 0, 0, 0, "boundary");
}

function checkCollisions() {
	console.log("i got in!");
	var i;
	var nrRemoved = 0;
	var toRemove = [];
	var nr = floatingTrash.length;
	console.log(nr + " trashes before");
	for (i=0; i < nrTrash; i++) {
		var trashUnit = floatingTrash[i];
		if (hasCollision(rocket, trashUnit)) {
			nrRemoved++;
			toRemove.push(trashUnit);
		}
	}
	for (i = 0; i < nrRemoved; i++) {
		var trashUnit = toRemove[i];
		floatingTrash.pop(trashUnit);
		trash.remove(trashUnit);
	}
	var nr = floatingTrash.length;
	nrTrash += -nrRemoved;
	console.log(nr + " trashes after");
}

function squareDistanceBetween(obj1, obj2) {
	var squareD;

	var x1 = obj1.position.x;
	var x2 = obj2.position.x;

	var y1 = obj1.position.y;
	var y2 = obj2.position.y;
	
	var z1 = obj1.position.z;
	var z2 = obj2.position.z;

	squareD = (x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2;

	return squareD;
}

function hasCollision(obj1, obj2) {
	var sphere1 = obj1.getObjectByName("boundary").geometry;
	var sphere2 = obj2.getObjectByName("boundary").geometry;
	console.log("rocketR:" + sphere1.parameters.radius + "; trashR:" + sphere2.parameters.radius);
	/*console.log("rocketP:[" + obj1.position.x + ", " + obj1.position.y + "," + obj1.position.z + "]");
	console.log("trash:[" + obj2.position.x + ", " + obj2.position.y + "," + obj2.position.z + "]");
	*/var totalR = sphere1.parameters.radius + sphere2.parameters.radius;
	return totalR**2 >= squareDistanceBetween(obj1, obj2);
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
	var radius = Math.sqrt((rocketPartHeight+boosterHeight)**2 + rocketInfRadius**2);
	addBoundary(rocket, radius);
	rocket.getObjectByName("boundary").visible = false; // !!
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
		i = 3;
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

// returns semi-hemisphhere of an object's geometric center
function getSemiHemisphere(obj) {
	var posY = obj.position.y;
	var posZ = obj.position.z;
	var northernHemisphere = false;	
	var easternHemisphere = false;

	if (posY > 0) northernHemisphere = true;
	if (posZ > 0) easternHemisphere = true;
	
	if (northernHemisphere && easternHemisphere) return 0; //NE
	else if (northernHemisphere && !easternHemisphere) return 1; //NW
	else if (!northernHemisphere && !easternHemisphere) return 2; //SW
	else if (!northernHemisphere && easternHemisphere) return 3; //SE

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
	var dirLatitudeCoef = -1; // clock-wise
	var dirLongitudeCoef = -1;

	if (rightArrow || leftArrow || upArrow || downArrow) { // rocket movement flags
		var rocketTheta = objAngles[0].x;
		var rocketPhi = objAngles[0].y;	
		var rocketX, rocketY, rocketZ;
		var rotZ = 0;
		
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
			rotZ = -Math.PI/2;
			rocketPhi += dirLongitudeCoef * degreesTraveled;
		}
		else if (rightArrow) {
			rotZ = Math.PI/2;
			rocketPhi += -dirLongitudeCoef * degreesTraveled;
		}
		else if (upArrow) {
			rotZ = 0;
			rocketTheta += dirLatitudeCoef * degreesTraveled;
		}
		else if (downArrow) {
			rotZ = Math.PI;
			rocketTheta += - dirLatitudeCoef * degreesTraveled;
		}

		rocketX = rocketTrashDistance * Math.sin(rocketTheta) * Math.sin(rocketPhi);
		rocketY = rocketTrashDistance * Math.cos(rocketTheta);
		rocketZ = rocketTrashDistance * Math.sin(rocketTheta) * Math.cos(rocketPhi);
		
		rocket.position.set(rocketX, rocketY, rocketZ);
		rocket.lookAt(scene.position);
		rocket.rotateZ(rotZ);
		objAngles[0].set(rocketTheta, rocketPhi);
		objPositions[0].set(rocketX, rocketY, rocketZ);
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

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	scene.background = space_texture;
	getObjPositions();
	getTrashGeometries();
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