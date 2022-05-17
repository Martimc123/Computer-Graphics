/*global THREE*/

"use strict";

var camera = [], scene, renderer, currentCamera = 0;

var viewSize = 50;
var aspectRatio;

var geometry, material, mesh;

var kitty;
var head;
var wires;

var cat_body;
var cat_face;

//const controls = new OrbitControls( camera[currentCamera], renderer.domElement );

// change to receive position, yes, but also body radius and height
function createKitty(x, y, z) {
    
    wires = true;
    kitty = new THREE.Object3D();

    // change for positions to be based on cylinder height and angle
    addBody(kitty, 0, 0, 0); // based on kitty origin position
    addFace(kitty, 6.5, 3, 0);

    kitty.position.set(x, y, z);

    scene.add(kitty);
	return kitty;
}

function addBody(obj, x, y, z) {
    geometry = new THREE.CylinderGeometry(2, 2, 8, 20, 1);
    material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: wires});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotateZ( Math.PI / 180 * 90);
    mesh.name="body";
    obj.add(mesh);
}

function addFace(obj, x, y, z) {
    geometry = new THREE.SphereGeometry(2);
    material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.name="face";
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
				{
					wires = false;
					kitty.getObjectByName("body").material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: wires});
					kitty.getObjectByName("face").material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
				}
				else
				{
					wires = true;
					kitty.getObjectByName("body").material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: wires});
					kitty.getObjectByName("face").material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: wires});
				}		
				break;
			default:
				break;
		}
    });   
}

function animate() {
    
    render();
    requestAnimationFrame(animate);
    //controls.update();
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
    window.addEventListener("resize", onResize);
}
