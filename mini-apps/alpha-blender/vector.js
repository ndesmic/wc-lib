export function getVectorMagnitude(vec) {
	return Math.sqrt(vec.reduce((sum, x) => sum + x ** 2, 0));
}


export function addVector(a, b) {
	return a.map((x, i) => x + b[i]);
}

export function subtractVector(a, b) {
	return a.map((x, i) => x - b[i]);
}

export function scaleVector(vec, s) {
	return vec.map(x => x * s);
}

export function divideVector(vec, s) {
	return vec.map(x => x / s);
}

export function normalizeVector(vec) {
	return divideVector(vec, getVectorMagnitude(vec));
}

//3x3
export function crossVector(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}

//vectors must have same length!
export function dotVector(a, b) {
	return a.reduce((sum, _, i) => sum + (a[i] * b[i]), 0);
}

export function invertVector(vec) {
	return vec.map(x => -x);
}

export function reflectVector(vec, normal) {
	return [
		vec[0] - 2 * dotVector(vec, normal) * normal[0],
		vec[1] - 2 * dotVector(vec, normal) * normal[1],
		vec[2] - 2 * dotVector(vec, normal) * normal[2],
	];
}