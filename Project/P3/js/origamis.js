// To generate the images, the videos and the overall project:
//  1. Run the command "python -m http.server" on a terminal in the index.html folder
//  2. Search for the url "localhost:8000" in a browser
// It may take a few seconds to load (about a minute, in the first try).
// For the Ubuntu wsl terminal, use "python -m SimpleHTTPServer 8000" instead

/*global THREE*/
var camera = [];
var scene= [];
var renderer, currentCamera = 0;
let cameraRatio = 10;

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
var wood_texture = new THREE.TextureLoader().load("./media/wood.jpg");
var glass_texture = new THREE.TextureLoader().load("./media/glass.jpg");
var direc_light;
var directionalLight;
var direc_intensity = 0.5;
var figures = [];
var change_material = true;
var qKey,wKey,eKey,rKey,tKey,yKey;
var reset = false;
let pause = false;
var OrtogonalCamera;

'use strict';

function createFloor(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(30,0.5, 40);
	material = new THREE.MeshPhongMaterial( { map: wood_texture } );
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
}

function createPalanque(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(20,0.5, 20);
	let geometry2 = new THREE.BoxGeometry(15,0.5, 15);
	material = new THREE.MeshLambertMaterial( { map: glass_texture } );
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh2 = new THREE.Mesh(geometry2, material);
	mesh2.position.set(x, y+2, z);
	obj.add(mesh);
	obj.add(mesh2);
}

function createMesh(obj,name,type,posx,posy,posz,rotX,rotY,rotZ,mat)
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
	renderer.autoClear = false;
	renderer.clear();
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene[0], camera[currentCamera]); // tells 3js renderer to draw scene visualization based on camera
	if (pause) {
		if (currentCamera == 1)
		{
			renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			renderer.render(scene[1], OrtogonalCamera2);
		}
		else
		{
			renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			renderer.render(scene[1],OrtogonalCamera);
		}
	}
}

function onResize() {

	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerWidth > 0 &&  window.innerHeight > 0){
		if (camera[currentCamera] === OrtogonalCamera) {
			var i;
			var val = 2;
			aspectRatio = window.innerWidth / window.innerHeight;
			renderer.setSize(window.innerWidth, window.innerHeight);
			for (i = 0; i < 1; i++) { // Ortographic Cameras
				camera[currentCamera].left = -viewSize * aspectRatio / val;
				camera[currentCamera].right = viewSize * aspectRatio / val;
				camera[currentCamera].top = viewSize / val;
				camera[currentCamera].bottom = viewSize / -val;
				camera[currentCamera].updateProjectionMatrix();
			}
		}
		else	
		{
			if((window.innerWidth / window.innerHeight) < 1.6) {
				camera[indexCamera].aspect = window.innerWidth / window.innerHeight;
				camera[indexCamera].updateProjectionMatrix();
				camera[indexCamera].lookAt(scene.position);
			}
		}
		
		camera[currentCamera].updateProjectionMatrix();
	}
}


function update()
{
	if(!pause)
	{
		var timeOccurred = clock.getDelta();
		var RotSpeed = 2.5;

		if (qKey || wKey || eKey || rKey || tKey || yKey) { // figures movement flags
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
}

function changeLightning(intensity) {
	universe.getObjectByName("directional").getObjectByName("light").intensity = intensity;
}

function changeMaterial(change) {
	for (i = 0; i < figures.length; i++)
	{
		if (change)
			figures[i].material = new THREE.MeshLambertMaterial( {color: 0xff0000} )
		else
			figures[i].material = new THREE.MeshPhongMaterial( {color: 0xffffff} )
	}
}

var i = 0;
function display() {
	resetState();
	changeLightning(direc_intensity);
	changeMaterial(change_material);
	requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function createCube(obj,x,y,z)
{
	const geometry = new THREE.BoxGeometry( 2, 2, 2 );
	const material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(x,y,z);
	obj.add(cube);
	figures.push(cube);
}

function createFig1(obj,x,y,z)
{
	//creates 1st figure
	
	//creates lower left triangle
	createMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*90,0,1);
	createMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*20,0,1);
	obj.position.set(x,y,z);

	universe.add(obj);
}

function createDirectionalLight(obj)
{
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
	directionalLight.position.set(0, 45, 45);
  	let lightHelper = new THREE.DirectionalLightHelper(directionalLight);
	directionalLight.name="light";
	obj.add( directionalLight );
	obj.add( lightHelper );
}

function createScene() {
	scene[0] = new THREE.Scene();
	scene[0].add(new THREE.AxesHelper(100));

	universe = new THREE.Object3D();
	universe.scale.set(1,1,1);

	direc_light = new THREE.Object3D();
	direc_light.name="directional";
	createDirectionalLight(direc_light);
	direc_light.rotateZ(Math.PI/180*30);
	console.log(direc_light);
	universe.add(direc_light);
	
	palanque = new THREE.Object3D();
	directionalLight.target = palanque;
	universe.add(palanque);
	createFloor(palanque,0,0,0);
	createPalanque(palanque,0,2,0);

	createCube(universe,0,4.5+1,5);
	createCube(universe,0,4.5+1,0);
	createCube(universe,0,4.5+1,-5);

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	universe.add( light );

	fig1 = new THREE.Object3D();
	//createFig1(fig1,10,10,10);

	fig2 = new THREE.Object3D();
	//createFig1(fig2,20,1,1);

	universe.position.set(0,0,0);
	scene[0].add(universe);
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
	
	camera.lookAt(scene[0].position);
	
	return camera;
}

//creates a new scene with Pause Mode
function createPauseMessage() {
	scene[1] = new THREE.Scene();
  
	let spriteMap = new THREE.TextureLoader().load('./media/pauseScreen.png');
	let spriteMaterial = new THREE.SpriteMaterial({
		map: spriteMap
	});
	let message = new THREE.Sprite(spriteMaterial);
	let scaleRatio = 100 * window.innerWidth / window.innerHeight;
	message.scale.set(scaleRatio, scaleRatio, 0);
	message.visible = true;
	message.position.set(0, 0, 20);
  
	scene[1].add(message);
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
	
	camera.lookAt(scene[0].position);
	
	return camera;
}

function onKeyDown(e) {
	var keyName = e.keyCode;
	switch (keyName) {
		case 49://1
			if(!pause)
				currentCamera = 0;
			break;
		case 50://2
			if(!pause)
				currentCamera = 1;
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
			if(!pause)
				direc_intensity = (direc_intensity == 0 ? 0.5 : 0);
			break;
		
		case 65://A
		case 97://a
			if(!pause)
				change_material = !change_material;
			break;
		
		case 77:
		case 109:
			if (pause)
				reset=true;
			break;

		case 83:	// Pause
		case 115:
			pause = !pause;
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

function resetState()
{
	if (pause)
	{
		if(reset == true)
		{
			change_material = true;
			changeMaterial(change_material);
			for(i=0;i<figures.length;i++)
				figures[i].rotation.y = 0;
			direc_intensity=0.5;
			changeLightning(direc_intensity);
		}
	}
	reset=false;
}

function createOrtogonalCamera(x, y, z) {
	// Adjusts camera ratio so the scene is totally visible 
	// OrthographicCamera( left, right, top, bottom, near, far )
	camera = new THREE.OrthographicCamera(window.innerWidth / -(2 * cameraRatio),
		window.innerWidth / (2 * cameraRatio), window.innerHeight / (2 * cameraRatio),
		window.innerHeight / -(2 * cameraRatio), 0, 1000);

	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(new THREE.Vector3(-x, -y, z));
	return camera;
}

function init() {
		
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	createScene();
	OrtogonalCamera = createOrtogonalCamera(0, 100, 20);
	OrtogonalCamera2 = createOrtogonalCamera(0, 10, 10);
	camera[0] = createPerspectiveCamera(viewSize/1.5,viewSize/4,0);
	camera[1] = createOrtographicCamera(0, viewSize,0);
	controls = new THREE.OrbitControls(camera[currentCamera], renderer.domElement);
	animate();
	createPauseMessage();

	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}
