import { parseFloatArrayOrDefault, parseFloatArrayWithLengthOrDefault } from "../../libs/wc-utils.js";

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

/***
 * @param {Object} kernel
 * @param {number[]} kernel.data
 * @param {number[]} kernel.shape  
 */
function convolute(imageData, kernel, oobBehavior = { x: "clamp", y: "clamp" }) {
	const output = new ImageData(imageData.width, imageData.height);
	const kRowMid = (kernel.shape[0] - 1) / 2; //kernels should have odd dimensions
	const kColMid = (kernel.shape[1] - 1) / 2;

	for (let row = 0; row < imageData.height; row++) {
		for (let col = 0; col < imageData.width; col++) {

			const sum = [0, 0, 0];
			for (let kRow = 0; kRow < kernel.shape[1]; kRow++) {
				for (let kCol = 0; kCol < kernel.shape[0]; kCol++) {
					const sampleRow = row + (-kRowMid + kRow);
					const sampleCol = col + (-kColMid + kCol);
					if (oobBehavior.x === "omit" && (sampleCol >= imageData.width || sampleCol < 0)) continue;
					if (oobBehavior.y === "omit" && (sampleRow >= imageData.height || sampleRow < 0)) continue;

					let color;
					if (Array.isArray(oobBehavior.x) && (sampleCol >= imageData.width || sampleCol < 0)) {
						color = oobBehavior.x;
					} else if (Array.isArray(oobBehavior.y) && (sampleRow >= imageData.height || sampleRow < 0)) {
						color = oobBehavior.y;
					} else {
						color = sample(imageData, sampleRow, sampleCol, oobBehavior);
					}

					const kernelValue = kernel.data[kRow * kernel.shape[0] + kCol];
					sum[0] += color[0] * kernelValue;
					sum[1] += color[1] * kernelValue;
					sum[2] += color[2] * kernelValue;
				}
			}

			setPx(output, col, row, [...sum, 1.0]);
		}
	}

	return output;
}

const identityKernel = [
	0, 0, 0,
	0, 1, 0,
	0, 0, 0
];

export class WcJsConvolutionCanvas extends HTMLElement {
	#image;
	#context;
	#kernel = identityKernel;
	#shape = [3, 3];
	#edges; //"clamp", "wrap", "mirror", "omit"
	#height = 240;
	#width = 320;
	#defaultEdgeValue = 0.0;

	static observedAttributes = ["image", "kernel", "shape", "edges"];
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
				image-rendering: pixelated;
			 }
			</style>
            <canvas width="${this.#height}" height="${this.#width}"></canvas>
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
		if (this.#kernel.length != this.#shape[0] * this.#shape[1]) return;
		this.#context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		if (this.#image) {
			this.#context.drawImage(this.#image, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
		}

		const imageData = this.#context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		const convolutedImageData = convolute(imageData, { data: this.#kernel, shape: this.#shape }, this.#edges ? { x: this.#edges, y: this.#edges } : undefined);
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
	set edges(val) {
		val = val.trim();
		this.#edges = val.startsWith("[") ? JSON.parse(val) : val;
	}
	set kernel(val) {
		this.#kernel = parseFloatArrayOrDefault(val, []);
		this.update();
	}
	set shape(val) {
		this.#shape = parseFloatArrayWithLengthOrDefault(val, 2, [0,0]);
		this.update();
	}
	set height(val) {
		val = parseInt(val);
		this.#height = val;
		if (this.dom) {
			this.dom.canvas.height = val;
		}
	}
	set width(val) {
		val = parseInt(val);
		this.#width = val;
		if (this.dom) {
			this.dom.canvas.width = val;
		}
	}
}

customElements.define("wc-js-convolution-canvas", WcJsConvolutionCanvas);