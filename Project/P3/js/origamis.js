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
var universe;
var loader = new THREE.TextureLoader();
var controls;
var fig1;
var fig2;
//var space_texture = new THREE.TextureLoader().load("./media/space.jpg");

//var compressed_trash_texture = new THREE.TextureLoader().load("./media/trash.jpg");


'use strict';

function createMesh(obj,name,type,posx,posy,posz,rotX,rotY,rotZ,mat)
{
	let shape = new THREE.Shape();
	let width, height,radius,x,y;
	const pos = new THREE.Vector3();
	let rot=0;
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
	controls.update();
}

function display() {
	requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function createFig1(obj,x,y,z)
{
	//creates 1st figure
	
	//creates lower left triangle
	createMesh(obj,'triangle',1,0,0,0,0,Math.PI/180*90,0,0);
	createMesh(obj,'triangle',1,0,0,0,0,Math.PI/180*20,0,0);
	obj.position.set(x,y,z);

	universe.add(obj);
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));

	universe = new THREE.Object3D();
	universe.scale.set(1,1,1);
	
	fig1 = new THREE.Object3D();
	createFig1(fig1,0,0,0);

	fig2 = new THREE.Object3D();
	createFig1(fig2,20,0,0);

	universe.position.set(0,0,0);
	scene.add(universe);
	//createMesh('triangle',1,0,10,0.8,0,-Math.PI/180*45,0);
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
	//camera[2] = createPerspectiveCamera(0, -rocketInfRadius*2.5, -rocketPartHeight*3);
	controls = new THREE.OrbitControls(camera[currentCamera], renderer.domElement);
	animate();
	
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}