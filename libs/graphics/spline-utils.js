export function catmullToBezier(catmullRomControlPoints) {
	const b0 = [catmullRomControlPoints[1][0], catmullRomControlPoints[1][1]];
	const b1 = [
		catmullRomControlPoints[1][0] + (catmullRomControlPoints[2][0] - catmullRomControlPoints[0][0]) / 6,
		catmullRomControlPoints[1][1] + (catmullRomControlPoints[2][1] - catmullRomControlPoints[0][1]) / 6,
	];
	const b2 = [
		catmullRomControlPoints[2][0] - (catmullRomControlPoints[3][0] - catmullRomControlPoints[1][0]) / 6,
		catmullRomControlPoints[2][1] - (catmullRomControlPoints[3][1] - catmullRomControlPoints[1][1]) / 6,
	];
	const b3 = [catmullRomControlPoints[2][0], catmullRomControlPoints[2][1]];
	return [b0, b1, b2, b3];
}
