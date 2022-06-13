var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(2, 3, 5).setLength(10);
camera.lookAt(scene.position);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

scene.add(new THREE.GridHelper(10, 10));

var pointStart = new THREE.Vector3(-1, 0, 3);
var pointEnd = new THREE.Vector3(-1, 0, -3);
var height = 4;
var thickness = 0.1;

var boxW = pointEnd.clone().sub(pointStart).length();
var boxH = height;
var boxD = thickness;

var boxGeometry = new THREE.BoxGeometry(boxW, boxH, boxD);
boxGeometry.translate(boxW * 0.5, boxH * 0.5, 0);
boxGeometry.rotateY(-Math.PI * 0.5);
var wall = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial({
  color: "red",
  wireframe: true
}));
wall.position.copy(pointStart);
wall.lookAt(pointEnd);
scene.add(wall);

addPoint(pointStart, "green");
addPoint(pointEnd, "yellow");

function addPoint(position, color) {
  let p = new THREE.Mesh(new THREE.SphereGeometry(0.125, 4, 2), new THREE.MeshBasicMaterial({
    color: color
  }));
  p.position.copy(position);
  scene.add(p);
}

render();

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}