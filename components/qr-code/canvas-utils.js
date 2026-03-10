export function arrayCanvasToCanvas(arrayCanvas, options) {
	const scale = options?.scale ?? 1;
	const canvas = document.createElement("canvas");
	canvas.width = arrayCanvas.width * scale;
	canvas.height = arrayCanvas.height * scale;
	const context = canvas.getContext("2d");

	drawArrayCanvas(context, arrayCanvas, options);

	return canvas;
}

export function drawArrayCanvas(context, arrayCanvas, options){
	const scale = options?.scale ?? 1;
	const height = scale * arrayCanvas.height;
	const width = scale * arrayCanvas.width;
	const pixels = context.getImageData(0, 0, height, width);
	for (let row = 0; row < arrayCanvas.height; row++) {
		for (let col = 0; col < arrayCanvas.width; col++) {
			const px = arrayCanvas.getPixel(col, row);
			for(let dx = 0; dx < scale; dx++){
				for(let dy = 0; dy < scale; dy++){
					drawPixel(pixels, (col * scale) + dx, (row * scale) + dy, px);
				}
			}
		}
	}
	context.putImageData(pixels, 0, 0);
}

export function drawQrCanvas(context, qrCanvas, options) {
	const scale = options?.scale ?? 1;
	const height = scale * qrCanvas.height;
	const width = scale * qrCanvas.width;
	const pixels = context.getImageData(0, 0, height, width);
	for (let row = 0; row < qrCanvas.height; row++) {
		for (let col = 0; col < qrCanvas.width; col++) {
			const px = qrCanvas.getMaskedPixel(col, row) ? 1 : 0
			for (let dx = 0; dx < scale; dx++) {
				for (let dy = 0; dy < scale; dy++) {
					drawPixel(pixels, (col * scale) + dx, (row * scale) + dy, px);
				}
			}
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