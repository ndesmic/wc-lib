export function multiplyMatrixVector(vector, matrix) {
	//normalize 3 vectors
	if (vector.length === 3) {
		vector.push(1);
	}

	return [
		vector[0] * matrix[0][0] + vector[1] * matrix[1][0] + vector[2] * matrix[2][0] + vector[3] * matrix[3][0],
		vector[0] * matrix[0][1] + vector[1] * matrix[1][1] + vector[2] * matrix[2][1] + vector[3] * matrix[3][1],
		vector[0] * matrix[0][2] + vector[1] * matrix[1][2] + vector[2] * matrix[2][2] + vector[3] * matrix[3][2],
		vector[0] * matrix[0][3] + vector[1] * matrix[1][3] + vector[2] * matrix[2][3] + vector[3] * matrix[3][3]
	];
}

//it's like multiplying with the transpose of the matrix
export function crossMultiplyMatrixVector(vector, matrix) {
	return [
		vector[0] * matrix[0][0] + vector[1] * matrix[0][1] + vector[2] * matrix[0][2] + vector[3] * matrix[0][3],
		vector[0] * matrix[1][0] + vector[1] * matrix[1][1] + vector[2] * matrix[1][2] + vector[3] * matrix[1][3],
		vector[0] * matrix[2][0] + vector[1] * matrix[2][1] + vector[2] * matrix[2][2] + vector[3] * matrix[2][3],
		vector[0] * matrix[3][0] + vector[1] * matrix[3][1] + vector[2] * matrix[3][2] + vector[3] * matrix[3][3],
	];
}

export function clampVector(vector, low = 0, high = 1) {
	return [
		Math.min(Math.max(vector[0], 0), 1),
		Math.min(Math.max(vector[1], 0), 1),
		Math.min(Math.max(vector[2], 0), 1),
		Math.min(Math.max(vector[3], 0), 1)
	];
}

export function multiplyVector(a, b) {
	return [
		a[0] * b[0],
		a[1] * b[1],
		a[2] * b[2],
		a[3] * b[3],
	];
}

export function multiplyMatrix(a, b) {
	const matrix = [
		new Array(4),
		new Array(4),
		new Array(4),
		new Array(4)
	];
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			matrix[r][c] = a[r][0] * b[0][c] + a[r][1] * b[1][c] + a[r][2] * b[2][c] + a[r][3] * b[3][c];
		}
	}

	return matrix;
}

export function transpose(matrix) {
	return [
		[matrix[0][0], matrix[1][0], matrix[2][0], matrix[3][0]],
		[matrix[0][1], matrix[1][1], matrix[2][1], matrix[3][1]],
		[matrix[0][2], matrix[1][2], matrix[2][2], matrix[3][2]],
		[matrix[0][3], matrix[1][3], matrix[2][3], matrix[3][3]],
	];
}

export function lerp(start, end, t) {
	const result = [];
	for (let row = 0; row < start.length; row++) {
		const newRow = [];
		for (let col = 0; col < start[0].length; col++) {
			newRow.push(start[row][col] + (end[row][col] - start[row][col]) * t)
		}
		result.push(newRow);
	} return result;
}