/*global THREE*/

var camera = []
var scene, renderer, currentCamera = 0;

var viewSize = 50;
var aspectRatio;

var geometry, material, mesh;

var kitty;
var head;
var wires;

var cat_torso;
var cat_face;
var qKey,wKey;

//var controls;

'use strict';

// change to receive position, yes, but also body radius and height
function createKitty(x, y, z) {
    
	wires = true;
	kitty = new THREE.Object3D();

	// change for positions to be based on cylinder height and angle
	// current torso spot: 4,5,2
	addKittyTorso(kitty, 0, 0, 0); // based on kitty origin position
	addKittyFace(kitty, 5, 4, 0);
	addKittyEye(kitty, 7, 3.5, -1, "eye1");
	addKittyEye(kitty, 7, 3.5, 1, "eye2");
	addKittyLeg(kitty, -3, -4, -1);
	addKittyLeg(kitty, -3, -4, 1);
	addKittyLeg(kitty, 1, -4, 1);
	addKittyLeg(kitty, 1, -4, -1);
	addKittyEar(kitty, 5, 6, 2,  Math.PI / 180 * 45);
	addKittyEar(kitty, 5, 6, -2,  Math.PI / 180 * -45);
	addKittyNose(kitty, 7.5, 3, 0);
	addKittyTail(kitty, -6, 3, 0);
	addKittyWhisker(kitty, 8, 3, 1);
	addKittyWhisker(kitty, 8, 2.5, 1);
	addKittyWhisker(kitty, 8, 3, -1);
	addKittyWhisker(kitty, 8, 2.5, -1);

  kitty.position.set(x, y, z);

	scene.add(kitty);
	return kitty;
}

function addKittyWhisker(obj, x, y, z) {
	geometry = new THREE.BoxGeometry(0.25, 1, 0.25, 1, 1, 1);
	material = new THREE.MeshBasicMaterial({ color: 0x5b0001, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateX(Math.PI/180 * 90);
	mesh.name="whisker";
	obj.add(mesh);
}

function addKittyNose(obj, x, y, z) {
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

function addKittyFace(obj, x, y, z) {
    geometry = new THREE.SphereGeometry(2);
    material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name="face";
    obj.add(mesh);
}

function addKittyEye(obj, x, y, z,tag) {
	geometry = new THREE.SphereGeometry(0.25);
	material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name=tag;
	obj.add(mesh);
}

function addKittyLeg(obj, x, y, z) {
	geometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 8, 1);
	material = new THREE.MeshBasicMaterial({ color: 0xf2a007, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name="leg";
	obj.add(mesh);
}

function addKittyEar(obj, x, y, z, angle) {
	geometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
	material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: wires});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.name="ear";
	mesh.rotateX(angle);
	obj.add(mesh);
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
            case "1":
                currentCamera = 0;
            break;

            case "2":
                currentCamera = 1;
            break;

            case "3":
                currentCamera = 2;
            break;

			case "4":
				if (wires == true)
					wires = false;
				else
					wires = true;
				break;

            case "Q": //q
                if (qKey == false)
                    qKey = true;
                else
                    qKey = false;
				break;
            
                
            case "q": //q
                if (qKey == false)
                    qKey = true;
                else
                    qKey = false;
				break;

            case "W": //w
                if (wKey == false)
                    wKey = true;
                else
                    wKey = false;
				break;
            
                
            case "w": //w
                if (wKey == false)
                    wKey = true;
                else
                    wKey = false;
				break;
                
			default:
				break;
		}
    });   
}

function changeWires(flag)
{
	kitty.getObjectByName("torso").material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: flag});
	kitty.getObjectByName("face").material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: flag});
	kitty.getObjectByName("eye1").material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: flag});
	kitty.getObjectByName("eye2").material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: flag});
}

function update(){
    document.addEventListener('keypress', (event) => {
        var name = event.key;
        if(qKey && name == "q"){
		    pivot.rotation.y += 0.09;
        }
        else if(wKey && name == "w"){
		    pivot.rotation.y += -0.09;
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
    kitty = createKitty(4, 5, 2);
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
	pivot.add(new THREE.AxesHelper(5));

	scene.add(pivot);
	pivot.add(kitty);

  //  controls = new THREE.OrbitControls( camera[currentCamera], renderer.domElement );
    window.addEventListener("resize", onResize);
}