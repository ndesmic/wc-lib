import { parseJsonOrDefault } from "../../libs/wc-utils.js";
import { getSingleOrArray } from "../../libs/array-utils.js";
import { loadImage } from "../../libs/image-utils.js";

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
function convolute(imageData, kernels, oobBehavior = { x: "clamp", y: "clamp" }) {
	let lastOutput = imageData;

	for(const kernel of kernels){
		const output = new ImageData(lastOutput.width, lastOutput.height);
		const kRowMid = (kernel.shape[0] - 1) / 2; //kernels should have odd dimensions
		const kColMid = (kernel.shape[1] - 1) / 2;

		for (let row = 0; row < lastOutput.height; row++) {
			for (let col = 0; col < lastOutput.width; col++) {

				const sum = [0, 0, 0];
				for (let kRow = 0; kRow < kernel.shape[1]; kRow++) {
					for (let kCol = 0; kCol < kernel.shape[0]; kCol++) {
						const sampleRow = row + (-kRowMid + kRow);
						const sampleCol = col + (-kColMid + kCol);
						if (oobBehavior.x === "omit" && (sampleCol >= lastOutput.width || sampleCol < 0)) continue;
						if (oobBehavior.y === "omit" && (sampleRow >= lastOutput.height || sampleRow < 0)) continue;

						let color;
						if (Array.isArray(oobBehavior.x) && (sampleCol >= lastOutput.width || sampleCol < 0)) {
							color = oobBehavior.x;
						} else if (Array.isArray(oobBehavior.y) && (sampleRow >= lastOutput.height || sampleRow < 0)) {
							color = oobBehavior.y;
						} else {
							color = sample(lastOutput, sampleRow, sampleCol, oobBehavior);
						}

						const kernelValue = kernel.values[kRow * kernel.shape[0] + kCol];
						sum[0] += color[0] * kernelValue;
						sum[1] += color[1] * kernelValue;
						sum[2] += color[2] * kernelValue;
					}
				}

				setPx(output, col, row, [...sum, 1.0]);
			}
		}
		lastOutput = output;
	}

	return lastOutput;
}

const identityKernel3x3 = {
	shape: [3,3],
	values: [
		0, 0, 0,
		0, 1, 0,
		0, 0, 0
	]
}

export class WcJsConvolutionCanvas extends HTMLElement {
	#image;
	#context;
	#kernels = [identityKernel3x3];
	#edges; //"clamp", "wrap", "mirror", "omit"
	#height = 240;
	#width = 320;
	#defaultEdgeValue = 0.0;

	static observedAttributes = ["image", "kernels", "edges"];
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
		if (!this.#kernels) return;

		this.#context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		if (this.#image) {
			this.#context.drawImage(this.#image, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
		}

		const imageData = this.#context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		const convolutedImageData = convolute(imageData, this.#kernels, this.#edges ? { x: this.#edges, y: this.#edges } : undefined);
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
	set kernels(val){
		const parsedValue = parseJsonOrDefault(val);
		if(!parsedValue) return;
		const value = getSingleOrArray(parsedValue);
		if(!value.every(k => k.values.length === (k.shape[0] * k.shape[1]))){
			//throw new Error("kernel values are not valid.");
			return;
		}
		this.#kernels = value;
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