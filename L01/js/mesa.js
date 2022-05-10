/*global THREE*/

var camera, scene, renderer;

var geometry, material, mesh;

function addTableTop(obj, x, y, z) {
	'use strict';
	geometry = new THREE.BoxGeometry(60, 2, 20);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	obj.add(mesh);
}

function addTableLeg(obj, x, y, z) {
	'use strict';
	geometry = new THREE.BoxGeometry(2, 6, 2);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y-3, z);
	obj.add(mesh);
}

function createTable(x, y, z) {
	'use strict';

	var table = new THREE.Object3D();

	material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true});

	addTableTop(table, 0, 0, 0);
	addTableLeg(table, -25 ,-1, -8);
	addTableLeg(table, -25 ,-1, 8);
	addTableLeg(table, 25 ,-1, 8);
	addTableLeg(table, 25 ,-1, -8);

	scene.add(table);

	table.position.x = x;
	table.position.y = y;
	table.position.z = z;
}

function render() {
	'use strict'; // strict mode makes for faster code and supresses some warnings
	renderer.render(scene, camera); // tells 3js renderer to draw scene visualization based on camera 
}

function createScene() {
	'use strict';
	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(10));
	createTable(0, 0, 0);
}

function createCamera() {
	'use strict';

	// FOV=70, Aspect ratio, ETX
	// scene could have ortogonal camera instead but its not the case
	camera = new THREE.PerspectiveCamera(70,
																		window.innerWidth/window.innerHeight,
																		1,
																		1000);
	camera.position.x = 50;
	camera.position.y = 50;
	camera.position.z = 50;
	camera.lookAt(scene.position); // camera pointed at scene axis
}

function init() {
	'use strict';

	renderer = new THREE.WebGLRenderer({antialias: true}); // antialias softens pixel transition when changing image size

	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement); // associates html to renderer
	createScene();
	createTable();
	createCamera();

	render();
}
