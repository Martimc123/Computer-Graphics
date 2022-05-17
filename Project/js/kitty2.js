/*global THREE*/

var camera, scene, renderer;
var geometry, material, mesh;


var controls;

// change to receive position, yes, but also body radius and height
function createKitty(x, y, z) {
	'use strict';
	
	var kitty = new THREE.Object3D();

	// change for positions to be based on cylinder height and angle
	addBody(kitty, 0, 0, 0); // based on kitty origin position
	addFace(kitty, 7.5, 3, 0);
	addEye(kitty, 7, 3.5, 2);
	addEye(kitty, 7, 3.5, 1);

	kitty.position.set(x, y, z);

	scene.add(kitty);
}

function addBody(obj, x, y, z) {
	'use strict';
	geometry = new THREE.CylinderGeometry(2, 2, 8, 20, 1);
	material = new THREE.MeshBasicMaterial({ color: 0x35e8df, wireframe: false});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.rotateZ( Math.PI / 180 * 90);
	obj.add(mesh);
}

function addFace(obj, x, y, z) {
	'use strict';
	geometry = new THREE.SphereGeometry(2);
	material = new THREE.MeshBasicMaterial({ color: 0xfde995, wireframe: false});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
}

function addEye(obj, x, y, z) {
	'use strict';
	geometry = new THREE.SphereGeometry(0.25);
	material = new THREE.MeshBasicMaterial({ color: 0x49b517, wireframe: false});
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
}

function render() {
	'use strict'; // strict mode makes for faster code and supresses some warnings
	renderer.render(scene, camera); // tells 3js renderer to draw scene visualization based on camera 
}

function onResize() {
	'use strict';

	renderer.setSize(window.innerWidth, window.innerHeight);

	if (window.innerWidth > 0 &&  window.innerHeight > 0) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}

}

function onKeyDown(e) {
	'use strict';

	switch(e.keyCode) {
		case 65: //A
		case 97: //a
			scene.traverse( function(node) {
				if (node instanceof THREE.Mesh) {
					node.material.wireframe = !node.material.wireframe;
				}
			});
			break;
		case 83: // S
		case 115: //s
			ball.userData.jumping = !ball.userData.jumping;
			break;
	}

}

function animate() {
	'use strict';
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function createScene() {
	'use strict';
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(100));
	createKitty(4, 5, 2);
}

function createCamera() {
	'use strict';

	// FOV=70, Aspect ratio, ETX
	// scene could have ortogonal camera instead but its not the case
	camera = new THREE.PerspectiveCamera(70,
																		window.innerWidth/window.innerHeight,
																		1,
																		1000);
	camera.position.x = 20;
	camera.position.y = 20;
	camera.position.z = 20;
	//camera.lookAt(scene.position); // camera pointed at scene axis
}

function init() {
	'use strict';

	renderer = new THREE.WebGLRenderer({antialias: true}); // antialias softens pixel transition when changing image size

	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement); // associates html to renderer
	createScene();
	createCamera();
	controls = new THREE.OrbitControls( camera, renderer.domElement);

	window.addEventListener("resize", onResize);

}
