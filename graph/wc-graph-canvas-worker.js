function windowValue(v, vmin, vmax, flipped = false) {
	v = flipped ? -v : v;
	return (v - vmin) / (vmax - vmin);
}

function createShape(context, shape, [x, y], size, color) {
	const halfSize = size / 2;
	switch (shape) {
		case "circle": {
			context.fillStyle = color;
			context.beginPath();
			context.ellipse(x, y, size, size, 0, 0, Math.PI * 2);
			context.closePath();
			context.fill();

			break;
		}
		case "square": {
			context.fillStyle = color;
			context.fillRect(x - halfSize, y - halfSize, size * 2, size * 2);
			break;
		}
	}
}

globalThis.onmessage = e => {
	let {
		points,
		xmax,
		ymax,
		xmin,
		ymin,
		step,
		func,
		width,
		height,
		defaultColor,
		defaultSize,
		defaultShape,
		continuous,
		thickness,
		devicePixelRatio,
		recipientId
	} = e.data;

	const canvas = new OffscreenCanvas(width * devicePixelRatio, height * devicePixelRatio);
	const context = canvas.getContext("2d");
	context.scale(devicePixelRatio, devicePixelRatio);

	if (func) {
		func = new Function(["x"], func);
		points = [];
		for (let x = xmin; x < xmax; x += step) {
			const y = func(x);
			points.push({ x, y, color: defaultColor, size: defaultSize, shape: defaultShape });
		}
	}

	points = points.map(p => ({
		x: windowValue(p.x, xmin, xmax) * width,
		y: windowValue(p.y, ymin, ymax, true) * height,
		color: p.color,
		size: p.size,
		shape: p.shape
	}));

	context.strokeStyle = "#000";
	context.moveTo(width / 2, 0);
	context.lineTo(width / 2, height);
	context.moveTo(0, height / 2);
	context.lineTo(width, height / 2);
	context.stroke();

	if (continuous) {
		context.strokeStyle = defaultColor;
		context.lineWidth = thickness;
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.stroke();
	}

	for (const point of points) {
		createShape(context, point.shape, [point.x, point.y], point.size, point.color);
	}

	const image = canvas.transferToImageBitmap();

	globalThis.postMessage({ image, recipientId }, [image]);
};