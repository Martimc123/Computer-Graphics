'use strict';

class OrigamiCraneA extends THREE.Mesh {
	constructor(mat) {
		super();
		this.material = mat;
		this.create();
		console.log("A4");
	}

	calculateNormal(posOG, pos1, pos2) {
		var p0 = new THREE.Vector3(posOG[0], posOG[1], posOG[2]);
		var p1 = new THREE.Vector3(pos1[0], pos1[1], pos1[2]);
		var p2 = new THREE.Vector3(pos2[0], pos2[1], pos2[2]);
		var v1 = p1-p0;
		var v2 = p2-p0;
		var norm = p0.crossVectors(v1, v2);
		norm.normalize();
		return [norm.x, norm.y, norm.z];
	}

	create() {
		var origamiGeometry = new THREE.BufferGeometry();
		var vertexNumComponents = 3;
		var normalNumComponents = 3;
		const vertices = new Float32Array (
			[ // left side
				1.0, 2.0, 2.0, 
				0.0, 0.0, 0.0,
				0.0, 4.0, 0.0,
				
				// right side 
				1.0, 2.0, -2.0,
				0.0, 4.0, 0.0,
				0.0, 0.0, 0.0
			]
		);
		const uvs = new Float32Array (
			[ 
				// left side
				0, 0,
				1, 0,
				0, 1,

				// right side
				0, 0,
				1, 0,
				0, 1
			]
		);

		var fullNormal1 = this.calculateNormal(
			[1.0, 2.0, 2.0],
			[0.0, 0.0, 0.0],
			[0.0, 4.0, 0.0]
		);
		var fullNormal2 = this.calculateNormal(
			[1.0, 2.0, -2.0], 
			[0.0, 4.0, 0.0],
			[0.0, 0.0, 0.0]
		);

		const norms = new Float32Array (
			[
			fullNormal1[0], fullNormal1[1], fullNormal1[2],
			fullNormal1[0], fullNormal1[1], fullNormal1[2],
			fullNormal1[0], fullNormal1[1], fullNormal1[2],
			fullNormal2[0], fullNormal2[1], fullNormal2[2],
			fullNormal2[0], fullNormal2[1], fullNormal2[2],
			fullNormal2[0], fullNormal2[1], fullNormal2[2],
			]
		);

		origamiGeometry.setAttribute(
			'position',
			new THREE.BufferAttribute(vertices, vertexNumComponents));

		origamiGeometry.setAttribute(
			'normal',
			new THREE.BufferAttribute(norms,normalNumComponents));
			
		origamiGeometry.computeVertexNormals();

		origamiGeometry.setAttribute(
		'uvs',
		new THREE.BufferAttribute(vertices, vertexNumComponents));

		this.geometry = origamiGeometry;
	}
}