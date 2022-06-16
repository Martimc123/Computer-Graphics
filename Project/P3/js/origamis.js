// To generate the images, the videos and the overall project:
//  1. Run the command "python -m http.server" on a terminal in the index.html folder
//  2. Search for the url "localhost:8000" in a browser
// It may take a few seconds to load (about a minute, in the first try).
// For the Ubuntu wsl terminal, use "python -m SimpleHTTPServer 8000" instead

/*global THREE*/

var camera = [];
var scene= [];
var renderer, currentCamera = 0;

var val = 2;
var val2 = 2;

var defaultScale = 1;
var viewSize = 50;
var aspectRatio = window.innerWidth/window.innerHeight;
var podiumStepHeight = 0.5;
var podiumBottomLen = 40;
var podiumTopLen = 0.75*podiumBottomLen;
var origamiLen = 2;
var origamiDist = 1/3*podiumTopLen;

var geometry, material, mesh;
var wiredObjects = [];
var wires = true;

var clock = new THREE.Clock();

var universe;
var loader = new THREE.TextureLoader();
var controls;
var fig1;
var fig2;
var wood_texture = new THREE.TextureLoader().load("./media/wood.jpg");
var glass_texture = new THREE.TextureLoader().load("./media/glass.jpg");
var gold_texture = new THREE.TextureLoader().load("./media/gold.jpg");
var dirLightObj;
var directionalLight;
var spotlights = [];
var dirLightIntensity = 0.5;
var allObj = [];
var allColors = [];
var figures = [];
var materials = [];
var currentMaterial = 0;
var isMaterialLambert = true;
var isMaterialLightSensitive = false;
var qKey,wKey,eKey,rKey,tKey,yKey;
var zKey, xKey, cKey;
let pause = false;
var OrtogonalPauseCamera;
var reset = false;

'use strict';

function addSpotlightHost(obj, xLoc, yLoc, zLoc) {
	material = materials[1];
	var color = 0x333333;
	material.color = color;

	geometry = new THREE.SphereGeometry(origamiLen/2);
	var sphere = new THREE.Mesh(geometry, material);
	allObj.push(sphere);
	allColors.push(color);

	geometry = new THREE.CylinderGeometry(0, origamiLen/2, origamiLen);
	var cone = new THREE.Mesh(geometry, material);
	allObj.push(cone);
	allColors.push(color);

	sphere.position.set(xLoc, yLoc, zLoc);
	cone.position.set(xLoc, yLoc, zLoc);
	obj.add(sphere);
	obj.add(cone);
}

function addSpotlight(obj, toLookObj, spotlight, x, y, z) {
	spotlight.position.set(x, y, z);
	obj.add(spotlight);
	spotlight.target = toLookObj;
	addSpotlightHost(obj, x, y, z);
}

function addObjPart(obj, geometry, mater, hex, x, y, z, rotX, rotY, rotZ,tag = "") {
	material = (mater != null)? mater : new THREE.MeshBasicMaterial({wireframe: wires});
	if (hex!=null)
		material.color=hex;
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
	geometry = new THREE.BoxGeometry(viewSize*2,0.1, viewSize*2);
	material = materials[1];
	var color = 0x222222;
	material.color = color;
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
	allObj.push(mesh);
	allColors.push(color);
}

function addPodium(obj, x, y, z) {
	var podiumObj = new THREE.Object3D();
	geometry = new THREE.BoxGeometry(podiumBottomLen,podiumStepHeight, podiumBottomLen);
	let geometry2 = new THREE.BoxGeometry(podiumTopLen,podiumStepHeight, podiumTopLen);
	material = materials[0];
	var color = 0x979aaa;
	material.color = color;
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, -podiumStepHeight/2, 0);
	mesh2 = new THREE.Mesh(geometry2, material);
	mesh2.position.set(0, podiumStepHeight/2, 0);
	podiumObj.add(mesh);
	podiumObj.add(mesh2);
	podiumObj.position.set(x,y,z);
	obj.add(podiumObj);
	allObj.push(mesh);
	allObj.push(mesh2);
	allColors.push(color);
	return podiumObj;
}

function addMesh(obj,name,type,posx,posy,posz,rotX,rotY,rotZ,mat)
{
	let shape = new THREE.Shape();
	let width;
	const pos = new THREE.Vector3();
	switch(name) {
		case 'triangle':
			width = 10;
			shape.moveTo(0,-width);
			shape.lineTo(0,width);
			shape.lineTo(width,0);
			shape.lineTo(0,-width);
			pos.x=0;
			pos.y=0;
			break;
		default:
			break;
	}
	if (type == 2)
		geometry = new THREE.ShapeBufferGeometry(shape);

	var shape_mat = materials[1];
	geometry.computeVertexNormals();
	mesh = new THREE.Mesh(geometry,shape_mat);
	mesh.position.copy(pos);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
	mesh.position.set(posx,posy,posz);
	mesh.name="teste";
	obj.add(mesh);
	allObj.push(mesh);
}

function render() {
	renderer.autoClear = false;
	renderer.clear();
	renderer.render(scene[0], camera[currentCamera]);
	if (pause) {
		if (currentCamera == 1)
			renderer.render(scene[1], OrtogonalPauseCamera2);
		else
			renderer.render(scene[1],OrtogonalPauseCamera);
	}
}

function render3() {
	renderer.autoClear = false;
	renderer.clear();
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene[0], camera[currentCamera]); // tells 3js renderer to draw scene visualization based on camera
	if (pause) {
		if (currentCamera == 1)
		{
			renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			renderer.render(scene[1], OrtogonalPauseCamera2);
		}
		else
		{
			renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			renderer.render(scene[1],OrtogonalPauseCamera);
		}
	}
}

function onResize() {
	if (window.innerWidth > 0 &&  window.innerHeight > 0){
		var i;
		aspectRatio = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth, window.innerHeight);
		var nrCameras = camera.length; 
		var nrPerspectiveCameras = 1;
		for (i=0; i < nrPerspectiveCameras; i++) { // perspective camera
				camera[i].aspect = window.innerWidth / window.innerHeight;
				camera[i].updateProjectionMatrix();
				camera[i].updateProjectionMatrix();
		}
		for (i =nrPerspectiveCameras; i< nrCameras; i++) { // ortographic cameras
			if (i==2)
				continue;
			camera[i].left = -viewSize * aspectRatio / val/ val2;
			camera[i].right = viewSize * aspectRatio / val/ val2;
			camera[i].top = viewSize / val / val2;
			camera[i].bottom = viewSize / -val / val2;
			camera[i].updateProjectionMatrix();
		}
	}
}


function update()
{
	controls.update();
	if(!pause)
	{
		var timeOccurred = clock.getDelta();
		var RotSpeed = 2.5;

		if (qKey || wKey || eKey || rKey || tKey || yKey) { // figures movement flags
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
	if (zKey) {
		spotlights[0].visible = !spotlights[0].visible;
		zKey = false;
	}
	if (xKey) {
		spotlights[1].visible = !spotlights[1].visible;
		xKey = false;
	}
	if (cKey) {
		spotlights[2].visible = !spotlights[2].visible;
		cKey = false;
	}
}

function changeMaterial(isMaterialLambert, isMaterialLightSensitive) {
	for (i = 0; i < allObj.length; i++)
	{
		if (isMaterialLightSensitive) {
			allObj[i].material = materials[0];
		}
		else if (isMaterialLambert)
			allObj[i].material = materials[1];
		else
			allObj[i].material = materials[2];
		
		allObj[i].material.color = allColors[i];
	}
}

function display() {
	resetState();
	changeLightning(dirLightIntensity);
	changeMaterial(isMaterialLambert, isMaterialLightSensitive);
	if (renderer.xr.getSession())
		renderer.setAnimationLoop(animate);
	else
		requestAnimationFrame(animate);
	render();
}

function animate() {
	update();
	display();
}

function addCube(obj, spotlight, x,y,z)
{
	const geometry = new THREE.BoxGeometry(origamiLen, origamiLen, origamiLen);
	const material = materials[1];
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(x,y,z);
	obj.add(cube);
	figures.push(cube);
	allObj.push(cube);
	allColors.push();
	addSpotlight(obj, cube, spotlight, x, y*4, z);
	return cube;
}

function calculateNormal(posOG, pos1, pos2) {
	var vec1 = [pos1[0]-posOG[0], pos1[1]-posOG[1], pos1[2]-posOG[2]];
	var vec2 = [pos2[0]-posOG[0], pos2[1]-posOG[1], pos2[2]-posOG[2]];
	var normX = (vec1[1]-vec2[2])*(vec1[2]-vec2[1]);
	var normY = (vec1[2]-vec2[0])*(vec1[0]-vec2[2]);
	var normZ = (vec1[0]-vec2[1])*(vec1[1]-vec2[0]);
	var crossProduct = (normX**2 + normY**2 + normZ**2)**0.5;
	var fullNormal = [normX/crossProduct, normY/crossProduct, normZ/crossProduct];
	return fullNormal;
}

function addOrigami(type, obj, spotlight, x,y,z) {
	var origami;
	if (type == 'A')
		origami = new OrigamiCraneA(materials[1]);
	else if (type == 'B')
		origami = new OrigamiCraneB(materials[1]);
	else if (type == 'C')
		origami = new OrigamiCraneC(materials[1]);
	origami.rotation.z= Math.PI/6;
	origami.position.set(x,y,z);
	obj.add(origami);
	allObj.push(origami);
	allColors.push(origami.material.color);
	figures.push(origami);
	addSpotlight(obj, origami, spotlight, x, y*4, z);
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
	directionalLight.position.set(viewSize/2, viewSize/2, 0);
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
	universe.add(dirLightObj);
	
	podium = addPodium(universe, 0, podiumStepHeight, 0);
	directionalLight.target = podium;
	addFloor(universe,0,0,0);
	addOrigami('A', universe, spotlights[0], 0, podiumStepHeight*2+origamiLen,origamiDist);
	addCube(universe, spotlights[1], 0, podiumStepHeight*2+origamiLen,0);
	addCube(universe, spotlights[2], 0, podiumStepHeight*2+origamiLen,-origamiDist);

	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	//universe.add( light );

	fig1 = new THREE.Object3D();
	//addFig1(fig1,-10,10,-10);

	fig2 = new THREE.Object3D();
	//addFig1(fig2,20,1,1);

	universe.position.set(0,0,0);
	scene[0].add(universe);
	//addMesh('triangle',1,0,10,0.8,0,-Math.PI/180*45,0);
}

//creates a new scene with Pause Mode
function createPauseMessage() {
	scene[1] = new THREE.Scene();
  
	let spriteMap = new THREE.TextureLoader().load('./media/pauseScreen.png');
	let spriteMaterial = new THREE.SpriteMaterial({
		map: spriteMap
	});
	let message = new THREE.Sprite(spriteMaterial);
	let scaleRatio = 50* window.innerWidth / window.innerHeight;
	message.scale.set(scaleRatio, scaleRatio, scaleRatio);
	message.visible = true;
	message.position.set(0, 0, 20);
  
	scene[1].add(message);
}

function onKeyDown(e) {
	var keyName = e.keyCode;
	switch (keyName) {
		case 32: // [SPACE], Pause
			pause = !pause;
			break;
		case 51://3
			reset = !reset;
		break;

		case 49://1
			if(!pause)
				currentCamera = 0;
			break;
		case 50://2
			if(!pause)
				currentCamera = 1;
			break;
		case 53://5
			if(!pause)
				currentCamera = 3;
			break;

		case 81: //Q
		case 113: //q
			if(!pause)
				qKey = true;
			break;
		case 87: //W
		case 119: //w
			if(!pause)	
				wKey = true;
			break;				
		case 69: //E
		case 101: //e
			if(!pause)
				eKey = true;
			break;
		case 82: //R
		case 114: //r
			rKey = true;
			break;		
			
		case 84: //T
		case 116: //t
			if(!pause)
				tKey = true;
			break;
		case 89: //Y
		case 121: //y
			if(!pause)
				yKey = true;
			break;		
		
		case 68:  //D
		case 100: //d
			if(!pause)
				dirLightIntensity = (dirLightIntensity == 0 ? 0.5 : 0);
			break;
		case 83://S
		case 115://s
			if(!pause)
				isMaterialLightSensitive = !isMaterialLightSensitive;
			break;
		
		case 90:// Z
		case 122://z
			if(!pause)
				zKey = !zKey;
			break;
		case 88://X
		case 120://x
			if(!pause)
				xKey = !xKey;
			break;
		case 67://C
		case 99://c
			if(!pause)
				cKey = !cKey;
			break;

		case 65://A
		case 97://a
			if(!pause)
				isMaterialLambert = !isMaterialLambert;
			break;

		case 52://4
			wires = !wires;
			break;
		default:
			break;
	}
}

function onKeyUp(e) {
	var keyName = e.keyCode;
	switch (keyName) {
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
	if (reset){
		if (pause) {
				isMaterialLambert = true;
				isMaterialLightSensitive = false;
				changeMaterial(isMaterialLambert, isMaterialLightSensitive);
				for(i=0;i<figures.length;i++)
					figures[i].rotation.y = 0;
				dirLightIntensity=0.5;
				changeLightning(dirLightIntensity);
				var nrSpotLights = spotlights.length;
				for (var i = 0; i < nrSpotLights; i++)
					spotlights[i].visible = true;
				currentCamera = 0;
		}
		reset = false;
	}
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

function createOrtographicCamera(x, y, z) {
	// Adjusts camera ratio so the scene is totally visible 
	// OrthographicCamera( left, right, top, bottom, near, far )
	var camera = new THREE.OrthographicCamera(-viewSize * aspectRatio / val / val2,
	viewSize * aspectRatio / val / val2, viewSize / val / val2, viewSize / -val / val2, 0, 1000);

	camera.position.x = x;
	camera.position.y = y;
	camera.position.z = z;
	camera.lookAt(new THREE.Vector3(-x, -y, z));
	return camera;
}


function createAllCameras() {
	OrtogonalPauseCamera = createOrtographicCamera(0, 100, 20);
	OrtogonalPauseCamera2 = createOrtographicCamera(0, 10, 10);
	camera[0] = createPerspectiveCamera(viewSize/2*defaultScale,viewSize/2*defaultScale,viewSize/2*defaultScale);
	camera[1] = createOrtographicCamera(podiumTopLen*defaultScale, podiumStepHeight*defaultScale,0*defaultScale);
	camera[2] = new THREE.StereoCamera();
	camera[3] = createPerspectiveCamera(viewSize/2*defaultScale,viewSize/2*defaultScale,viewSize/2*defaultScale); // for orbit controls
	camera[4] = OrtogonalPauseCamera;
	camera[5] = OrtogonalPauseCamera2;
	controls = new THREE.OrbitControls(camera[3], renderer.domElement);
}

function createAllMaterials() {
	/*
	materials[0] = new THREE.MeshBasicMaterial( {color: 0x555555, map: gold_texture, side: THREE.DoubleSide} );
	materials[1] = new THREE.MeshLambertMaterial( {color: 0xff0000, map: gold_texture, side: THREE.DoubleSide} );
	materials[2] = new THREE.MeshPhongMaterial( {color: 0xffffff, map: gold_texture, side: THREE.DoubleSide});	
*/
	
	materials[0] = new THREE.MeshBasicMaterial( {color: 0x555555, map: gold_texture, side: THREE.FrontSide}, {color: 0xffffff, map: wood_texture, side: THREE.BackSide});
	materials[1] = new THREE.MeshLambertMaterial( {color: 0xff0000, map: gold_texture, side: THREE.FrontSide}, {color: 0xffffff, map: wood_texture, side: THREE.BackSide} );
	materials[2] = new THREE.MeshPhongMaterial( {color: 0xffffff, map: gold_texture, side: THREE.FrontSide}, {color: 0xffffff, map: glass_texture, side: THREE.BackSide});	

	/*	
	materials[0] = new THREE.MeshBasicMaterial( {color: 0x555555, map: wood_texture, side: THREE.DoubleSide} );
	materials[1] = new THREE.MeshLambertMaterial( {color: 0x777777, map: wood_texture, side: THREE.DoubleSide} );
	materials[2] = new THREE.MeshPhongMaterial( {color: 0xffffff, map: wood_texture, side: THREE.DoubleSide});
*/
	/*
		materials[0] = [
		new THREE.MeshBasicMaterial( {color: 0x555555, map: wood_texture, side: THREE.FrontSide}),
		new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.BackSide})
	];
	materials[1] = [
		new THREE.MeshLambertMaterial( {color: 0x555555, map: wood_texture, side: THREE.FrontSide}),
		new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.BackSide})
	];
	materials[2] = [
		new THREE.MeshPhongMaterial( {color: 0x555555, map: wood_texture, side: THREE.FrontSide}),
		new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.BackSide})
	];
*/
}

function createAllSpotLights() {
	spotlights[0] = new THREE.SpotLight(0xffffff, 0.5);
	spotlights[1] = new THREE.SpotLight(0xffffff, 0.5);
	spotlights[2] = new THREE.SpotLight(0xffffff, 0.5);
}

function init() {
		
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;  //
	
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);
	
	createAllMaterials();
	createAllSpotLights();
	createScene();
	createAllCameras();
	document.body.appendChild( VRButton.createButton( renderer ) );
	animate();
	createPauseMessage();

	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}