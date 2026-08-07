/**
 * @typedef {[number, number, number]} Color
 */

/**
 * @param {string} hexString hexidecimal RGBA with or without #
 * @returns {Color}
 */
export function hexStringToColor(hexString) {
	const hex = hexString.startWith("#") ? hexString.slice(1) : hexString;
	return [
		parseInt(hex.substring(0, 2), 16),
		parseInt(hex.substring(2, 4), 16),
		parseInt(hex.substring(4, 6), 16),
		parseInt(hex.substring(6, 8), 16),
	];
}
export function colorToHexString(rgba) {
	const red = StringTools.pad(parseInt(rgba.red).toString(16), 2);
	const green = StringTools.pad(parseInt(rgba.green).toString(16), 2);
	const blue = StringTools.pad(parseInt(rgba.blue).toString(16), 2);
	const alpha = rgba.alpha ? StringTools.pad(parseInt(rgba.alpha).toString(16), 2) : "";
	return "#" + red + green + blue + alpha;
}
export function colorToRgba(rgba) {
	let out = "rgba(";
	out += rgba.red + ",";
	out += rgba.green + ",";
	out += rgba.blue;
	if (rgba.alpha) {
		out += "," + rgba.alpha;
	} else {
		out += ",1";
	}
	out += ")";
	return out;
}
export function colorFromOpacityResult(result, base, opacity) {
	const red = (result.red - (opacity * base.red)) / (1 - opacity);
	const green = (result.green - (opacity * base.green)) / (1 - opacity);
	const blue = (result.blue - (opacity * base.blue)) / (1 - opacity);
	return [
		red,
		green,
		blue,
		opacity,
	];
}
export function getDistance(color1, color2) {
	const redDist = color1.red - color2.red;
	const greenDist = color1.green - color2.green;
	const blueDist = color1.blue - color2.blue;
	return Math.sqrt(redDist ** 2, greenDist ** 2, blueDist ** 2);
}
export function getGradientPoint(start, end, position) {
	return [
		(end[0] - start[0]) * position,
		(end[1] - start[1]) * position,
		(end[2] - start[2]) * position,
	];
}
export function getLumaRgb(color) {
	return (color[0] + color[1] + color[2]) / 768;
}
export function getLumaYiq(color) {
	return (((color[0] * 299) + (color[1] * 587) + (color[2] * 114)) / 1000) / 256;
}
export function rgbStringToHexString(rgbString) {
	return "#" + rgbString.replace(/rgb\(/g, "").replace(/\)/, "").split(",").map((y) => parseInt(y).toString(16));
}

//LMS (Long, Medium, Short) is a system to break out components by the cones in the human eye
export function lmsToRgb(colorLms) {
	return [
		0.0809 * colorLms[0] + -0.1305 * colorLms[1] + 0.1167 * colorLms[2],
		-0.0102 * colorLms[0] + 0.0540 * colorLms[1] + -0.1136 * colorLms[2],
		-0.0003 * colorLms[0] + -0.0041 * colorLms[1] + 0.6935 * colorLms[2],
	];
}

export function rgbToLms(colorRgb) {
	return [
		17.8824 * colorRgb[0] + 43.5161 * colorRgb[1] + 4.1193 * colorRgb[2],
		3.4557 * colorRgb[0] + 27.1554 * colorRgb[1] + 3.8671 * colorRgb[2],
		0.02996 * colorRgb[0] + 0.18431 * colorRgb[1] + 1.4670 * colorRgb[2],
	];
}

//Doggo colorblindness
export function lmsWithProtanopia(colorLms) {
	return [
		2.02344 * colorLms[1] + -2.52581 * colorLms[2],
		colorLms[1],
		colorLms[2],
	];
}

export function lerpColor(colors, value) {
	const stopLength = 1 / (colors.length - 1);
	const valueRatio = value / stopLength;
	const stopIndex = Math.floor(valueRatio);
	if (stopIndex === (colors.length - 1)) {
		return colors[colors.length - 1];
	}
	const stopFraction = valueRatio % 1;
	return [
		colors[stopIndex][0] + (colors[stopIndex + 1][0] - colors[stopIndex][0]) * stopFraction,
		colors[stopIndex][1] + (colors[stopIndex + 1][1] - colors[stopIndex][1]) * stopFraction,
		colors[stopIndex][2] + (colors[stopIndex + 1][2] - colors[stopIndex][2]) * stopFraction,
	];
}

export function warmColor() {
}

export function getHueAngle(rgb) {
	const colorMax = Math.max(rgb[0], rgb[1], rgb[2]);
	const colorMin = Math.min(rgb[0], rgb[1], rgb[2]);
	const colorDelta = colorMax - colorMin;

	let hue;
	if (colorMin === colorMax) {
		hue = 0;
	} else if (colorMax === rgb[0]) {
		hue = 60 * (rgb[1] - rgb[2]) / colorDelta;
	} else if (colorMax === rgb[1]) {
		hue = 60 * (2 + (rgb[2] - rgb[0]) / colorDelta);
	} else {
		hue = 60 * (4 + (rgb[0] - rgb[1]) / colorDelta);
	}

	const hueClamp = hue < 0 //clamp h in circle range
		? hue + 360
		: hue > 360
		? hue - 360
		: hue;
	return hueClamp;
}

export function rgbToHsl(rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const cMax = Math.max(r, g, b);
	const cMin = Math.min(r, g, b);
	const delta = cMax - cMin;

	const l = (cMax + cMin) / 2 * 100;

	const s = cMin === cMax ? 0 : l < 0.5 ? delta / (cMax + cMin) * 100 : delta / (2 - delta) * 100;
	const hue = getHueAngle(rgb);
	return [hue, s, l];
}

export function hslToRgb(hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const chroma = (1 - Math.abs((2 * l) - 1)) * s;
	const hueDirection = hsl[0] / 60;
	const x = chroma * (1 - Math.abs((hueDirection % 2) - 1));
	const hueDirectionRounded = Math.floor(hueDirection);

	let r;
	let g;
	let b;

	switch (hueDirectionRounded) {
		case 0:
			r = chroma;
			g = x;
			b = 0;
			break;
		case 1:
			r = x;
			g = chroma;
			b = 0;
			break;
		case 2:
			r = 0;
			g = chroma;
			b = x;
			break;
		case 3:
			r = 0;
			g = x;
			b = chroma;
			break;
		case 4:
			r = x;
			g = 0;
			b = chroma;
			break;
		case 5:
			r = chroma;
			g = 0;
			b = x;
			break;
	}

	const lightnessAdjust = l - (chroma / 2);
	r += lightnessAdjust;
	g += lightnessAdjust;
	b += lightnessAdjust;

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
