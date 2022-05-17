/*global THREE*/

var camera = [];
var scene, renderer, currentCamera = 0;

var viewSize = 50;
var aspectRatio;

var geometry, material, mesh;

var kitty;
var head;
var wires;
var defaultScale = 1;

var cat_torso;
var cat_face;
var qKey,wKey,aKey,sKey,dKey,cKey,zKey,xKey;

//var controls;

'use strict';

// change to receive position, yes, but also body radius and height
function createKitty(x, y, z, scale) {
		
	wires = true;
	kitty = new THREE.Object3D();

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
	kitty.scale.set(scale,scale,scale);

	scene.add(kitty);
	return kitty;
}

function addKittyPart(obj, tag, geometry, hex, x, y, z, rotX, rotY, rotZ) {
	material = new THREE.MeshBasicMaterial({ color: hex, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateX(rotX);
	mesh.rotateY(rotY);
	mesh.rotateZ(rotZ);
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
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 20, 1);
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
	geometry = new THREE.SphereGeometry(0.25);
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

	var val = 2;
	var newAspectRatio = window.innerWidth / window.innerHeight;
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	camera[currentCamera].left = -viewSize * newAspectRatio / val;
	camera[currentCamera].right = viewSize * newAspectRatio / val;
	camera[currentCamera].top = viewSize / val;
	camera[currentCamera].bottom = viewSize / -val;
	camera[currentCamera].updateProjectionMatrix();
			
	aspectRatio = window.innerWidth / innerHeight;

}

function keys()
{
	document.addEventListener ('keypress', (event) => {
		const keyName = event.key;
		switch (keyName) {
			case "1"://1
				currentCamera = 0;
				break;
			case "2"://2
				currentCamera = 1;
				break;
			case "3"://3
				currentCamera = 2;
				break;
			case "4"://4
				wires = !wires;
				break;
			case "A": //A
			case "a": //a
				aKey = !aKey;
				break;
			case "S": //S
			case "s": //s
				sKey = !sKey;
				break;
			case "Q": //Q
			case "q": //q
				qKey = !qKey;
				break;
			case "W": //W
			case "w": //w
				wKey = !wKey;
				break;					
			case "Z": //Z
			case "z": //z
				zKey = !zKey;
				break;
			case "X": //X
			case "x": //x
				xKey = !xKey;
				break;
			case "D": //D
			case "d": //d
				dKey = !dKey;
				break;
			case "C": //C
			case "c": //c
				cKey = !cKey;
				break;
			default:
				break;
		}
	});   
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

function arrow_up()
{
		kitty.translateY(0.2);
}

function arrow_down()
{
		kitty.translateY(-0.2);
}

function arrow_left()
{
		kitty.translateZ(0.2);
}

function arrow_right()
{
		kitty.translateZ(-0.2);
}

function update(){
		document.addEventListener('keypress', (event) => {
			var name = event.key;
			var max_rotation = Math.PI/35;
			var min_rotation = -Math.PI/35;
			if(qKey && name == "q"){
				pivot.rotation.y += 0.2;
			}
			else if(wKey && name == "w"){
				pivot.rotation.y += -0.2;
			}
			else if(aKey && name == "a"){
				var head = kitty.getObjectByName("head");
				if(head.rotation.z < max_rotation)
					head.rotation.z += 0.02;
			}
			else if(sKey && name == "s"){
				var head = kitty.getObjectByName("head");
				if(head.rotation.z > min_rotation)
					head.rotation.z += -0.02;
			}
			else if(zKey && name == "z"){
				var ear1 = kitty.getObjectByName("head").getObjectByName("ear1");
				ear1.rotation.z += 0.2;
			}
			else if(xKey && name == "x"){
				var ear1 = kitty.getObjectByName("head").getObjectByName("ear1");
				ear1.rotation.z += -0.2;
			}
			else if(dKey && name == "d"){
				kitty.translateX(0.2);
			}
			else if(cKey && name == "c"){
				kitty.translateX(-0.2);
			}
		}, false);
}



function animate() {
	requestAnimationFrame(animate);
	changeWires(wires);
//	controls.update();
	render();
}

function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	kitty = createKitty(4, 5, 2, defaultScale);
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
	camera[0] = createCamera(50, 0, 0);
	camera[1] = createCamera(0, 50, 0);
	camera[2] = createCamera(0, 0, 50);
	pivot = new THREE.Group();

	scene.add(pivot);
	pivot.add(kitty);

	//  controls = new THREE.OrbitControls( camera[currentCamera], renderer.domElement );
	window.addEventListener("resize", onResize);
}