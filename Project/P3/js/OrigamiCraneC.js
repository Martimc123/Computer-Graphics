'use strict';

class OrigamiCraneC extends THREE.Mesh {
	constructor(mat) {
		super();
		this.material = mat;
		this.create();
		console.log("C1");
	}

	calculateNormal(posOG, pos1, pos2) {
		var vec1 = [pos1[0]-posOG[0], pos1[1]-posOG[1], pos1[2]-posOG[2]];
		var vec2 = [pos2[0]-posOG[0], pos2[1]-posOG[1], pos2[2]-posOG[2]];
		var normX = (vec1[1]-vec2[2])*(vec1[2]-vec2[1]);
		var normY = (vec1[2]-vec2[0])*(vec1[0]-vec2[2]);
		var normZ = (vec1[0]-vec2[1])*(vec1[1]-vec2[0]);
		var crossProduct = (normX**2 + normY**2 + normZ**2)**0.5;
		var fullNormal = [normX/crossProduct, normY/crossProduct, normZ/crossProduct];
		return fullNormal;
	}

	create() {
		var origamiGeometry = new THREE.BufferGeometry();
		var vertexNumComponents = 3;
		var normalNumComponents = 3;
		var uvNumComponents = 2;
		const vertices = new Float32Array (
			[ 
				// tail
				0.0, 1.5, 0.0,
				1.0, 1.5, 2.0,
				0.0, 0.0, 1.0,
				
				// tummy
				0.0, 1.5, 0.0,
				0.0, 0.0, -0.5, 
				0.0, 0.0, 1.0,

				// lungs
				0.0, 1.5, 0.0,
				0.0, 1.5, -1.0,
				0.0, 0.0, -0.5,
				
				// neck - bottom
				0.0, 1.5, -1.0,
				1.0, 1.5, -1.5,
				0.0, 0.0, -0.5,

				// neck - top
				0.0, 1.5, -1.0, 
				1.0, 1.5, -1.5,
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
			[0.0, 1.5, 0.0],
			[1.0, 1.5, 2.0],
			[0.0, 0.0, 1.0]
		);
		var fullNormal2 = this.calculateNormal(
			[0.0, 1.5, 0.0], 
			[0.0, 0.0, -0.5],
			[0.0, 0.0, 1.0]
		);
		var fullNormal3 = this.calculateNormal(
			[0.0, 1.5, 0.0],
			[0.0, 1.5, -1.0],
			[0.0, 0.0, -0.5]
		);
		var fullNormal4 = this.calculateNormal(
			[0.0, 1.5, -1.0],
			[1.0, 1.5, -1.5],
			[0.0, 0.0, -0.5]
		);
		var fullNormal5 = this.calculateNormal(
			[0.0, 1.5, -1.0],
			[1.0, 1.5, -1.5],
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