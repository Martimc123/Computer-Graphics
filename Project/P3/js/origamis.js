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

var viewSize = 50;
var aspectRatio;
var podiumStepHeight = 0.5;
var podiumBottomLen = 20;
var podiumTopLen = 0.75*podiumBottomLen;
var origamiLen = 2;
var origamiDist = 1/3*podiumTopLen;

var geometry, material, mesh;
var wiredObjects = [];
var wires = true;

var clock = new THREE.Clock();

var defaultScale = 1;
var universe;
var loader = new THREE.TextureLoader();
var controls;
var fig1;
var fig2;
var wood_texture = new THREE.TextureLoader().load("./media/wood.jpg");
var glass_texture = new THREE.TextureLoader().load("./media/glass.jpg");
var dirLightObj;
var directionalLight;
var dirLightIntensity = 0.5;
var figures = [];
var isMaterialLambert = true;
var qKey,wKey,eKey,rKey,tKey,yKey;
var i = 0;
var reset = false;
let pause = false;
var OrtogonalCamera;

'use strict';

function addFloor(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(viewSize*2,0.1, viewSize*2);
	material = new THREE.MeshPhongMaterial( { map: wood_texture } );
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
}

function addPodium(obj, x, y, z) {
	var podiumObj = new THREE.Object3D();
	geometry = new THREE.BoxGeometry(podiumBottomLen,podiumStepHeight, podiumBottomLen);
	let geometry2 = new THREE.BoxGeometry(podiumTopLen,podiumStepHeight, podiumTopLen);
	material = new THREE.MeshLambertMaterial( { map: glass_texture } );
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, -podiumStepHeight/2, 0);
	mesh2 = new THREE.Mesh(geometry2, material);
	mesh2.position.set(0, podiumStepHeight/2, 0);
	podiumObj.add(mesh);
	podiumObj.add(mesh2);
	podiumObj.position.set(x,y,z);
	obj.add(podiumObj);
	return podiumObj;
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
//	console.log(geometry);
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

function render2()
{
	renderer.render(scene[0], camera[currentCamera]);
    camera[currentCamera].updateWorldMatrix();
    camera[2].update(camera[currentCamera]);
    const size = new THREE.Vector2();
    renderer.getSize(size);

    renderer.setScissorTest(true);

    renderer.setScissor(0, 0, size.width / 2, size.height);
    renderer.setViewport(0, 0, size.width / 2, size.height);
    renderer.render(scene[0], camera[2].cameraL);

    renderer.setScissor(size.width, 0, size.width / 2, size.height);
    renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
    renderer.render(scene[0], camera[2].cameraR);

    renderer.setScissorTest(false);
}

function onResize() {

	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerWidth > 0 &&  window.innerHeight > 0){
		var indexCamera;
		var val = 2;
		var nrCameras = camera.length;
		for (indexCamera=0; i<nrCameras;i++){
			if (camera[indexCamera] === OrtogonalCamera) {
				aspectRatio = window.innerWidth / window.innerHeight;
				camera[indexCamera].left = -viewSize * aspectRatio / val;
				camera[indexCamera].right = viewSize * aspectRatio / val;
				camera[indexCamera].top = viewSize / val;
				camera[indexCamera].bottom = viewSize / -val;
			}
			else if((window.innerWidth / window.innerHeight) < 1.6) {
					camera[indexCamera].aspect = window.innerWidth / window.innerHeight;
					camera[indexCamera].updateProjectionMatrix();
					camera[indexCamera].lookAt(scene.position);
			}
			camera[indexCamera].updateProjectionMatrix();
		}
	}
}


function update() {
	if(!pause) {
		var timeOccurred = clock.getDelta();
		var RotSpeed = 2.5;

		if (qKey || wKey || eKey || rKey || tKey || yKey) { // figure's movement flags
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

			if (qKey)
				figures[0].rotation.y += -RotSpeed * timeOccurred;
			else if (wKey)
				figures[0].rotation.y += RotSpeed * timeOccurred;
			
			if (eKey)
				figures[1].rotation.y += -RotSpeed * timeOccurred;
			else if (rKey)
				figures[1].rotation.y += RotSpeed * timeOccurred;
			
			if (tKey)
				figures[2].rotation.y += -RotSpeed * timeOccurred;
			else if (yKey)
				figures[2].rotation.y += RotSpeed * timeOccurred;
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
			figures[i].material = new THREE.MeshLambertMaterial( {color: 0xff0000} )
		else
			figures[i].material = new THREE.MeshPhongMaterial( {color: 0xffffff} )
	}
}

function display() {
	resetState();
	changeLightning(dirLightIntensity);
	changeMaterial(isMaterialLambert);
	requestAnimationFrame(animate);
	render();
	VRinit();
}

function animate() {
	update();
	display();
}

function addCube(obj,x,y,z)
{
	const geometry = new THREE.BoxGeometry( origamiLen, origamiLen, origamiLen );
	const material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(x,y,z);
	obj.add(cube);
	figures.push(cube);
}

function addFig1(obj,x,y,z)
{
	//adds 1st figure
	
	//adds lower left triangle
	addMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*90,0,1);
	addMesh(obj,'triangle',2,0,0,0,0,Math.PI/180*20,0,1);
	obj.position.set(x,y,z);

	universe.add(obj);
}

function addDirectionalLight(obj)
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
	universe.scale.set(defaultScale,defaultScale,defaultScale);

	dirLightObj = new THREE.Object3D();
	dirLightObj.name="directional";
	addDirectionalLight(dirLightObj);
	dirLightObj.rotateZ(Math.PI/180*30);
//	console.log(dirLightObj);
	universe.add(dirLightObj);
	
	podium = addPodium(universe, 0, podiumStepHeight, 0);
	directionalLight.target = podium;
	addFloor(universe,0,0,0);

	addCube(universe,0,podiumStepHeight*2+origamiLen,origamiDist);
	addCube(universe,0,podiumStepHeight*2+origamiLen,0);
	addCube(universe,0,podiumStepHeight*2+origamiLen,-origamiDist);

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	universe.add( light );

	fig1 = new THREE.Object3D();
	//addFig1(fig1,10,10,10);

	fig2 = new THREE.Object3D();
	//addFig1(fig2,20,1,1);

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
		case 88:	// X, Pause
		case 120: // x, Pause
			pause = !pause;
			break;

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
			currentCamera = 3;
			break;

		case 53://5
			wires = !wires;
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
				dirLightIntensity = (dirLightIntensity == 0 ? 0.5 : 0);
			break;
		
		case 65://A
		case 97://a
			isMaterialLambert = !isMaterialLambert;
			break;
		
		case 77: // M, reset
		case 109: // m, reset
			reset=true;
			break;

		default:
			break;
	}
}

function onKeyUp(e) {
	var keyName = e.keyCode;
	switch (keyName) {
		case 88: //X - replace by the refresh symbol
		case 120: //x
			refreshKey = false;
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
	if (pause && reset) {
			isMaterialLambert = true;
			changeMaterial(isMaterialLambert);
			for(i=0;i<figures.length;i++)
				figures[i].rotation.y = 0;
			dirLightIntensity=0.5;
			changeLightning(dirLightIntensity);
			currentCamera = 0;
	}
	reset=false;
	pause = false;
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

function VRinit()
{
	if (renderer.xr.getSession())
	{
		renderer.setAnimationLoop( function () {
			renderer.render( scene[0], camera[currentCamera] );
		} );
	}
}

function init() {
		
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	document.body.appendChild( VRButton.createButton( renderer ) );
	renderer.xr.enabled = true;
	
	createScene();
	OrtogonalCamera = createOrtogonalCamera(0, 100, 20);
	OrtogonalCamera2 = createOrtogonalCamera(0, 10, 10);
	camera[0] = createPerspectiveCamera(viewSize/1.5,viewSize/4,0);
	camera[1] = createOrtographicCamera(0, viewSize,0);
	camera[2] = new THREE.StereoCamera();
	camera[3] = createPerspectiveCamera(viewSize/1.5,viewSize/4,0); // camera for orbit controls, do not delete!
	controls = new THREE.OrbitControls(camera[3], renderer.domElement);
	animate();
	createPauseMessage();

	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}