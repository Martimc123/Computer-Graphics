/*global THREE*/

var camera = []
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
	// current torso spot: 4,5,2
	addKittyTorso(kitty, 0, 0, 0); // based on kitty origin position
	var head = new THREE.Object3D();
	head.add(addKittyFace(5, 4, 0));
	head.add(addKittyEye(7, 3.5, -1, "eye1"));
	head.add(addKittyEye(7, 3.5, 1, "eye2"));
  head.add(addKittyEar(5, 6, 2,  Math.PI / 180 * 45,"ear1"));
	head.add(addKittyEar(5, 6, -2,  Math.PI / 180 * -45,"ear2"));
	addKittyNose(head, 7.5, 3, 0);
  addKittyWhisker(head, 8, 3, 1,"whisker1");
	addKittyWhisker(head, 8, 2.5, 1,"whisker2");
	addKittyWhisker(head, 8, 3, -1,"whisker3");
	addKittyWhisker(head, 8, 2.5, -1,"whisker4");

	head.name="head";
	kitty.add(head);
	var legs = new THREE.Object3D();
	legs.add(addKittyLeg(-3, -4, -1,"leg1"));
	legs.add(addKittyLeg(-3, -4, 1,"leg2"));
	legs.add(addKittyLeg(1, -4, 1,"leg3"));
	legs.add(addKittyLeg(1, -4, -1,"leg4"));
	legs.name="legs";
  kitty.add(legs);
    
  addKittyTail(kitty, -6, 3, 0);
	
  kitty.position.set(x, y, z);
	kitty.scale.set(scale,scale,scale);

	scene.add(kitty);
	return kitty;
}

function addKittyWhisker(obj,x, y, z,tag) {
	geometry = new THREE.BoxGeometry(0.25, 1, 0.25, 1, 1, 1);
	material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateX(Math.PI/180 * 90);
	mesh.name=tag;
	obj.add(mesh);
}

function addKittyNose(obj,x, y, z) {
	geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5, 1, 1, 1);
	material = new THREE.MeshBasicMaterial({ color: 0xef64bc, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name="nose";
	obj.add(mesh);
}

function addKittyTail(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 20, 1);
	material = new THREE.MeshBasicMaterial({ color: 0x9B26B6, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateZ( Math.PI / 180 * 45);
	mesh.name="tail";
	obj.add(mesh);
}

function addKittyTorso(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(2, 2, 8, 20, 1);
	material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateZ( Math.PI / 180 * 90);
	mesh.name="torso";
	obj.add(mesh);
}

function addKittyFace(x, y, z) {
	geometry = new THREE.SphereGeometry(2);
	material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name="face";
	return mesh;
}

function addKittyEye(x, y, z,tag) {
	geometry = new THREE.SphereGeometry(0.25);
	material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	return mesh;
}

function addKittyLeg(x, y, z,tag) {
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 8, 1);
	material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	return mesh;
}

function addKittyEar(x, y, z, angle,tag) {
	geometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
	material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	mesh.rotateX(angle);
	return mesh;
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
				if (wires == true)
					wires = false;
				else
					wires = true;	
				break;
			case "A": //A
			case "a": //a
				if (aKey == false)
						aKey = true;
				else
						aKey = false;
				break;
			case "S": //S
			case "s": //s
				if (sKey == false)
						sKey = true;
				else
						sKey = false;
				break;
			case "Q": //Q
			case "q": //q
					if (qKey == false)
						qKey = true;
					else
						qKey = false;
					break;
			case "W": //W
			case "w": //w
				if (wKey == false)
						wKey = true;
				else
						wKey = false;
				break;					
            case "Z": //Z
            case "z": //z
                if (zKey == false)
                        zKey = true;
                else
                        zKey = false;
                break;
            case "X": //X
            case "x": //x
                if (xKey == false)
                        xKey = true;
                else
                        xKey = false;
                break;
            case "D": //D
            case "d": //d
                if (dKey == false)
                    dKey = true;
                else
                    dKey = false;
                break;
            
            case "C": //C
            case "c": //c
                if (cKey == false)
                    cKey = true;
                else
                    cKey = false;
                break;
    
            default:
                break;
		}
	});   
}


function changeWires(wires)
{
	kitty.getObjectByName("torso").material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("face").material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
  kitty.getObjectByName("head").getObjectByName("nose").material = new THREE.MeshBasicMaterial({ color: 0xef64bc, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("eye1").material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("eye2").material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("whisker1").material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("whisker2").material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("whisker3").material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("whisker4").material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("ear1").material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wires});
	kitty.getObjectByName("head").getObjectByName("ear2").material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wires});
	kitty.getObjectByName("tail").material = new THREE.MeshBasicMaterial({ color: 0x9B26B6, wireframe: wires});
	kitty.getObjectByName("legs").getObjectByName("leg1").material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
	kitty.getObjectByName("legs").getObjectByName("leg2").material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
	kitty.getObjectByName("legs").getObjectByName("leg3").material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
	kitty.getObjectByName("legs").getObjectByName("leg4").material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
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
				var head = kitty.getObjectByName("head").getObjectByName("ear1");
				head.rotation.z += 0.2;
			}
			else if(xKey && name == "x"){
				var head = kitty.getObjectByName("head").getObjectByName("ear1");
				head.rotation.z += -0.2;
			}
            else if(dKey && name == "d"){
                pivot.translateX(0.2);
            }
            else if(cKey && name == "c"){
                pivot.translateX(-0.2);
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