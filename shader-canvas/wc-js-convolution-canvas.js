function clamp(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	return Math.max(Math.min(value, max), min);
}

function wrap(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	return value < min
		? max - Math.abs(min - value) % range
		: min + (value + range) % range;
}

function mirrorWrap(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	const minDistance = Math.abs(min - value);
	const intervalValue = minDistance % range;
	if (value % (max + max) > max) return max - intervalValue //too high (mirrored)
	if (value >= max) return min + intervalValue; //to high (unmirrored)
	if (value < min && minDistance % (range + range) > range) return max - intervalValue; //too low (mirrored)
	if (value <= min) return min + intervalValue; //to low (mirrored)
	return value;
}

function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

function readOob(value, min, max, behavior) {
	switch (behavior) {
		case "clamp": return clamp(value, min, max - 1);
		case "wrap": return wrap(value, min, max);
		case "mirror": return mirrorWrap(value, min, max);
		default: return value;
	}
}

function sample(imageData, row, col, oobBehavior) {
	const sampleCol = readOob(col, 0, imageData.width, oobBehavior.x);
	const sampleRow = readOob(row, 0, imageData.height, oobBehavior.y);

	const offset = (sampleRow * imageData.width * 4) + (sampleCol * 4);
	return [
		imageData.data[offset + 0] / 255,
		imageData.data[offset + 1] / 255,
		imageData.data[offset + 2] / 255,
		imageData.data[offset + 3] / 255
	]
}

function setPx(imageData, col, row, val) {
	col = clamp(col, 0, imageData.width);
	row = clamp(row, 0, imageData.height);
	const offset = (row * imageData.width * 4) + (col * 4);
	return [
		imageData.data[offset + 0] = val[0] * 255,
		imageData.data[offset + 1] = val[1] * 255,
		imageData.data[offset + 2] = val[2] * 255,
		imageData.data[offset + 3] = val[3] * 255
	]
}


function convolute(imageData, kernel, oobBehavior = { x: "clamp", y: "clamp" }) {
	const output = new ImageData(imageData.width, imageData.height);
	const kRowMid = (kernel.length - 1) / 2; //kernels should have odd dimensions
	const kColMid = (kernel[0].length - 1) / 2;

	for (let row = 0; row < imageData.height; row++) {
		for (let col = 0; col < imageData.width; col++) {

			const sum = [0,0,0];
			for (let kRow = 0; kRow < kernel.length; kRow++) {
				for (let kCol = 0; kCol < kernel[kRow].length; kCol++) {
					const sampleRow = row + (-kRowMid + kRow);
					const sampleCol = col + (-kColMid + kCol);
					if(oobBehavior.x === "omit" && (sampleCol >= imageData.width || sampleCol < 0)) continue;
					if(oobBehavior.y === "omit" && (sampleRow >= imageData.height || sampleRow < 0)) continue;
					
					let color;
					if (Array.isArray(oobBehavior.x) && (sampleCol >= imageData.width || sampleCol < 0)){
						color = oobBehavior.x;
					} else if (Array.isArray(oobBehavior.y) && (sampleRow >= imageData.height || sampleRow < 0)) {  
						color = oobBehavior.y;
					} else {
						color = sample(imageData, sampleRow, sampleCol, oobBehavior);
					}

					sum[0] += color[0] * kernel[kRow][kCol];
					sum[1] += color[1] * kernel[kRow][kCol];
					sum[2] += color[2] * kernel[kRow][kCol];
				}
			}

			setPx(output, col, row, [...sum, 1.0]);
		}
	}

	return output;
}

const indentityKernel = [
	[0, 0, 0],
	[0, 1, 0],
	[0, 0, 0]
];

export class WcJsConvolutionCanvas extends HTMLElement {
	#image;
	#context;
	#kernel = indentityKernel;
	#edges; //"clamp", "wrap", "mirror", "omit"
	#defaultEdgeValue = 0.0;

	static observedAttributes = ["image", "kernel", "edges"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.createShadowDom = this.createShadowDom.bind(element);
		this.update = this.update.bind(element);
	}
	createShadowDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
			 :host {
				 display: block;
			 }
			 canvas {
				width: 180px;
				height: 180px;
				image-rendering: pixelated;
			 }
			</style>
            <canvas width="640" height="480"></canvas>
        `;
	}
	connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.#context = this.dom.canvas.getContext("2d");
		this.update();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas")
		};
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue
		}
	}
	update() {
		if (!this.#context || !this.#image) return;
		this.#context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		if (this.#image) {
			this.#context.drawImage(this.#image, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
		}

		const imageData = this.#context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		const convolutedImageData = convolute(imageData, this.#kernel, this.#edges ? { x: this.#edges, y: this.#edges } : undefined );
		this.#context.putImageData(convolutedImageData, 0, 0);
	}
	set image(val) {
		loadImage(val)
			.then(img => {
				this.#image = img;
				this.dom.canvas.width = img.naturalWidth;
				this.dom.canvas.height = img.naturalHeight;
				this.update();
			});
	}
	set edges(val){
		val = val.trim();
		this.#edges = val.startsWith("[") ? JSON.parse(val) : val;
	}
	set kernel(val) {
		this.#kernel = Array.isArray(val) ? val : JSON.parse(val);
		this.update();
	}
}

customElements.define("wc-js-convolution-canvas", WcJsConvolutionCanvas);