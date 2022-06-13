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
var podiumStepHeight = 0.5;
var podiumBottomLen = 20;
var podiumTopLen = 0.75*podiumBottomLen;

var geometry, material, mesh;
var wiredObjects = [];
var wires = false;

var leftArrow, rightArrow, upArrow, downArrow;
var clock = new THREE.Clock();

var defaultScale = 1;
var universe;
var loader = new THREE.TextureLoader();
var controls;
var fig1;
var fig2;
var wood_texture;
var glass_texture;
var lambertMaterial;
var phongMaterial;
loader.load("./media/wood.jpg", (texture) => {
  wood_texture = texture;
	phongMaterial = new THREE.MeshPhongMaterial({color: 0x333333, map: wood_texture, side: THREE.DoubleSide});
});
loader.load("./media/glass.jpg", (texture) => {
  glass_texture = texture;
	lambertMaterial = new THREE.MeshLambertMaterial({color: 0x55555, map: glass_texture, side: THREE.DoubleSide})
});
var dirLightObj;
var directionalLight;
var dirLightIntensity = 0.5;
var figures = [];
var isMaterialLambert = true;
var qKey,wKey,eKey,rKey,tKey,yKey;

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

function addFloor(obj, x, y, z) {
	geometry = new THREE.PlaneGeometry(viewSize*2, viewSize*2);
	material = phongMaterial;
	addObjPart(obj, geometry, material, 0x449999, x, y, z, -Math.PI*90);
}

function addPodium(obj, x, y, z) {
	var podium = new THREE.Object3D();
	addPodiumBottom(podium, 0, -podiumStepHeight/2, 0);
	addPodiumTop(podium, 0, podiumStepHeight/2, 0);	
	podium.position.set(x, y, z);
	obj.add(podium);
	return podium;
}

function addPodiumBottom(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(podiumBottomLen,podiumStepHeight, podiumBottomLen);
	material = lambertMaterial;
	addObjPart(obj, geometry, material, 0x449999, x, y, z);
}

function addPodiumTop(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(podiumTopLen,podiumStepHeight, podiumTopLen);
	material = lambertMaterial;
	addObjPart(obj, geometry, material, 0x449999, x, y, z);
}

function addMesh(obj,name,type,posx,posy,posz,rotX,rotY,rotZ,mat)
{
	let shape = new THREE.Shape();
	let width;
	const pos = new THREE.Vector3();
	const extrudeSettings = {
		depth: 0.002,
		bevelEnabled: true,
		bevelSegments: 1,
		steps: 0,
		bevelSize: 0,
		bevelThickness: 0.1
	}
	switch(name)
	{
		case 'square':
			width = 10;
			shape.moveTo(0,0);
			shape.lineTo(0,width);
			shape.lineTo(width,width);
			shape.lineTo(width,0);
			shape.lineTo(0,0);
			pos.x=-40;
			pos.y=-40;
			break;
		
		case 'triangle':
			width = 10;
			shape.moveTo(0,-width);
			shape.lineTo(0,width);
			shape.lineTo(width,0);
			shape.lineTo(0,-width);
			pos.x=0;
			pos.y=0;
			break;
	}
	let geometry;
	if (type == 1)
		geometry = new THREE.ExtrudeBufferGeometry(shape,extrudeSettings);
	if (type == 2)
		geometry = new THREE.ShapeBufferGeometry(shape);
	
	var shape_mat;
	if(mat == 1)
		shape_mat = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
	geometry.computeVertexNormals();
	console.log(geometry);
	mesh = new THREE.Mesh(geometry,shape_mat);
	mesh.position.copy(pos);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
	mesh.position.set(posx,posy,posz);
	mesh.name="teste";
	obj.add(mesh);
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


function update()
{
	var timeOccurred = clock.getDelta();
	var RotSpeed = 2.5;

	if (qKey || wKey || eKey || rKey || tKey || yKey) { // rocket movement flags
		if (qKey)
			figures[0].rotation.y += RotSpeed * timeOccurred;
		if (wKey)
			figures[0].rotation.y += -RotSpeed * timeOccurred;
		
		if (eKey)
			figures[1].rotation.y += RotSpeed * timeOccurred;
		if (rKey)
			figures[1].rotation.y += -RotSpeed * timeOccurred;
		
		if (tKey)
			figures[2].rotation.y += RotSpeed * timeOccurred;
		if (yKey)
			figures[2].rotation.y += -RotSpeed * timeOccurred;
		
		if (qKey && wKey) {
			qKey = false;
			wKey = false;
		}

		if (eKey && rKey) {
			eKey = false;
			rKey = false;
		}

		if (tKey && yKey) {
			tKey = false;
			yKey = false;
		}
	}
}

function changeLightning(intensity) {
	universe.getObjectByName("directional").getObjectByName("light").intensity = intensity;
}

function changeMaterial(isMaterialLambert) {
	for (i = 0; i < figures.length; i++)
	{
		if (isMaterialLambert)
			figures[i].material = lambertMaterial
		else
			figures[i].material = phongMaterial;
	}
}

var i = 0;
function display() {
	changeLightning(dirLightIntensity);
	changeMaterial(isMaterialLambert);
	requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function addCube(obj,x,y,z)
{
	const geometry = new THREE.BoxGeometry( 2, 2, 2 );
	const material = phongMaterial;
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(x,y,z);
	obj.add(cube);
	figures.push(cube);
}

function addFig1(obj,x,y,z)
{
	//creates 1st figure
	
	//creates lower left triangle
	addMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*90,0,1);
	addMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*20,0,1);
	obj.position.set(x,y,z);

	universe.add(obj);
}

function addDirectionalLight(obj)
{
	directionalLight = new THREE.DirectionalLight( 0xffffff,dirLightIntensity);
	directionalLight.name="light";
	obj.add( directionalLight );
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));

	universe = new THREE.Object3D();
	universe.scale.set(1,1,1);

	dirLightObj = new THREE.Object3D();
	dirLightObj.name="directional";
	addDirectionalLight(dirLightObj);
	dirLightObj.rotateZ(Math.PI/180*30);
	console.log(dirLightObj);
	universe.add(dirLightObj);
	
	podium = addPodium(universe, 0, podiumStepHeight, 0);
	directionalLight.target = podium;
	addFloor(podium,0,0,0);
	addPodium(podium,0,2,0);

	addCube(universe,0,4.5+1,5);
	addCube(universe,0,4.5+1,0);
	addCube(universe,0,4.5+1,-5);

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	universe.add( light );

	fig1 = new THREE.Object3D();
	addFig1(fig1,10,10,10);

	fig2 = new THREE.Object3D();
	//addFig1(fig2,20,1,1);

	universe.position.set(0,0,0);
	scene.add(universe);
	//addMesh('triangle',1,0,10,0.8,0,-Math.PI/180*45,0);
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
			case 55://7
			currentCamera = 3;
			break;
		
		case 81: //Q
		case 113: //q
			qKey = true;
			break;
		case 87: //W
		case 119: //w
			wKey = true;
			break;			
		
		case 69: //E
		case 101: //e
			eKey = true;
			break;
		case 82: //R
		case 114: //r
			rKey = true;
			break;		
			
		case 84: //T
		case 116: //t
			tKey = true;
			break;
		case 89: //Y
		case 121: //y
			yKey = true;
			break;		
		
		case 68:  //D
		case 100: //d
			dirLightIntensity = (dirLightIntensity == 0 ? 0.5 : 0);
			break;
		
		case 65://A
		case 97://a
			isMaterialLambert = !isMaterialLambert;
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

		case 81: //Q
		case 113: //q
			qKey = false;
			break;
		case 87: //W
		case 119: //w
			wKey = false;
			break;			
		
		case 69: //E
		case 101: //e
			eKey = false;
			break;
		case 82: //R
		case 114: //r
			rKey = false;
			break;		
			
		case 84: //T
		case 116: //t
			tKey = false;
			break;
		case 89: //Y
		case 121: //y
			yKey = false;
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
	camera[0] = createPerspectiveCamera(viewSize/1.5,viewSize/4,0);
	camera[1] = createOrtographicCamera(0, viewSize,0);
	camera[2] = createOrtographicCamera(0, viewSize,0);
	camera[3] = createOrtographicCamera(0, viewSize,0);
	controls = new THREE.OrbitControls(camera[3], renderer.domElement);
	animate();
	
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}
