export function arrayCanvasToCanvas(arrayCanvas) {
	const canvas = document.createElement("canvas");
	canvas.width = arrayCanvas.width;
	canvas.height = arrayCanvas.height;
	const context = canvas.getContext("2d");

	drawArrayCanvas(context, arrayCanvas);

	return canvas;
}

export function drawArrayCanvas(context, arrayCanvas){
	const pixels = context.getImageData(0, 0, arrayCanvas.height, arrayCanvas.width);
	for (let row = 0; row < arrayCanvas.height; row++) {
		for (let col = 0; col < arrayCanvas.width; col++) {
			drawPixel(pixels, col, row, arrayCanvas.getPixel(col, row));
		}
	}
	context.putImageData(pixels, 0, 0);
}

export function drawQrCanvas(context, qrCanvas) {
	const pixels = context.getImageData(0, 0, qrCanvas.height, qrCanvas.width);
	for (let row = 0; row < qrCanvas.height; row++) {
		for (let col = 0; col < qrCanvas.width; col++) {
			drawPixel(pixels, col, row, qrCanvas.getMaskedPixel(col, row) ? 1 : 0);
		}
	}
	context.putImageData(pixels, 0, 0);
}

function drawPixel(imageData, x, y, colorId) {
	let color;
	switch (colorId) {
		case 0: { color = [255, 255, 255]; } break;
		case 1: { color = [0, 0, 0]; } break;
		case 2: { color = [0, 0, 255]; } break;
		case 3: { color = [255, 0, 0]; } break;
		default: throw new Error(`Bad color: ${colorId}`);
	}
	imageData.data[(y * imageData.width * 4) + (x * 4) + 0] = color[0];
	imageData.data[(y * imageData.width * 4) + (x * 4) + 1] = color[1];
	imageData.data[(y * imageData.width * 4) + (x * 4) + 2] = color[2];
	imageData.data[(y * imageData.width * 4) + (x * 4) + 3] = 255;
}