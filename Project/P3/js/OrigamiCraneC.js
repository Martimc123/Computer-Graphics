'use strict';

class OrigamiCraneC extends THREE.Mesh {
	constructor(mat) {
		super();
		this.material = mat;
		this.create();
		console.log("C1");
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
		var uvNumComponents = 2;
		const vertices = new Float32Array (
			[ 
				// tail
				-1.0, 1.5, 2.0, 
				0.0, 1.5, 0.0,
				0.0, 0.0, 1.0,
				
				// tummy
				0.0, 1.5, 0.0,
				0.0, 0.0, -0.5, 
				0.0, 0.0, 1.0,

				// lungs
				0.0, 1.5, 0.0,
				-1.0, 1.5, -1.0,
				0.0, 0.0, -0.5,
				
				// neck - bottom
				-1.0, 1.5, -1.0,
				0.0, 1.5, -1.5,
				0.0, 0.0, -0.5,

				// neck - top
				-1.0, 1.5, -1.0, 
				0.0, 1.5, -1.5,
				0.0, 4.0, -1.0,
				
				// head
				0.0, 4.0, -1.5, 
				0.0, 3.5, -2.0,
				0.0, 4.0, -1.0,
			]
		);
		const uvs = new Float32Array (
			[ 
				// tail
				0, 0,
				1, 0,
				0, 1,

				// tummy
				0, 0,
				1, 0,
				0, 1,

				// lungs
				0, 0,
				1, 0,
				0, 1,

				// neck - bottom1
				0, 0,
				1, 0,
				0, 1,

				// neck - bottom2
				0, 0,
				1, 0,
				0, 1,

				// neck - top
				0, 0,
				1, 0,
				0, 1,

				// head
				0, 0,
				1, 0,
				0, 1
			]
		);

		var fullNormal1 = this.calculateNormal(
			[-1.0, 1.5, 2.0],
			[0.0, 1.5, 0.0],
			[0.0, 0.0, 1.0]
		);
		var fullNormal2 = this.calculateNormal(
			[0.0, 1.5, 0.0], 
			[0.0, 0.0, -0.5],
			[0.0, 0.0, 1.0]
		);
		var fullNormal3 = this.calculateNormal(
			[0.0, 1.5, 0.0],
			[-1.0, 1.5, -1.0],
			[0.0, 0.0, -0.5]
		);
		var fullNormal4 = this.calculateNormal(
			[-1.0, 1.5, -1.0],
			[0.0, 1.5, -1.5],
			[0.0, 0.0, -0.5]
		);
		var fullNormal5 = this.calculateNormal(
			[-1.0, 1.5, -1.0],
			[0.0, 1.5, -1.5],
			[0.0, 4.0, -1.0]
		);
		var fullNormal6 = this.calculateNormal(
			[0.0, 4.0, -1.5], 
			[0.0, 3.5, -2.0],
			[0.0, 4.0, -1.0]
		);

		const norms = new Float32Array (
			[
			fullNormal1[0], fullNormal1[1], fullNormal1[2]
			,fullNormal1[0], fullNormal1[1], fullNormal1[2]
			,fullNormal1[0], fullNormal1[1], fullNormal1[2]
			,fullNormal2[0], fullNormal2[1], fullNormal2[2]
			,fullNormal2[0], fullNormal2[1], fullNormal2[2]
			,fullNormal2[0], fullNormal2[1], fullNormal2[2]
			,fullNormal3[0], fullNormal3[1], fullNormal3[2]
			,fullNormal3[0], fullNormal3[1], fullNormal3[2]
			,fullNormal3[0], fullNormal3[1], fullNormal3[2]
			,fullNormal4[0], fullNormal4[1], fullNormal4[2]
			,fullNormal4[0], fullNormal4[1], fullNormal4[2]
			,fullNormal4[0], fullNormal4[1], fullNormal4[2]
			,fullNormal5[0], fullNormal5[1], fullNormal5[2]
			,fullNormal5[0], fullNormal5[1], fullNormal5[2]
			,fullNormal5[0], fullNormal5[1], fullNormal5[2]
			,fullNormal6[0], fullNormal6[1], fullNormal6[2]
			,fullNormal6[0], fullNormal6[1], fullNormal6[2]
			,fullNormal6[0], fullNormal6[1], fullNormal6[2]
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