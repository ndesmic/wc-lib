import { parseJsonOrDefault } from "../../libs/wc-utils.js";
import { getSingleOrArray } from "../../libs/array-utils.js";
import { loadImage } from "../../libs/image-utils.js";
import { convolute } from "../../libs/convolution-utils.js";

/** @typedef {import("../../libs/image-sample-utils.js").OobBehavior} OobBehavior */
/** @typedef {import("../../types/tensor.d.ts").Tensor} Tensor */

/***
 * @param {ImageData} imageData
 * @param {Tensor[]} kernels
 * @param {OobBehavior | "omit"} oobBehavior }  
 */
function convoluteMultiple(imageData, kernels, oobBehavior) {
	let lastOutput = imageData;

	for(const kernel of kernels){
		lastOutput = convolute(lastOutput, kernel, oobBehavior);
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
	/** @type {OobBehavior | "omit"} */
	#edges;
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
			<div id="status"></div>
        `;
	}
	connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.#context = this.dom.canvas.getContext("2d", { willReadFrequently: true });
		this.update();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			status: this.shadowRoot.querySelector("status")
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
		const convolutedImageData = convoluteMultiple(imageData, this.#kernels, this.#edges ? { x: this.#edges, y: this.#edges } : undefined);
		this.#context.putImageData(convolutedImageData, 0, 0);
	}
	set image(val) {
		loadImage(val)
			.then(img => {
				this.#image = img;
				this.dom.canvas.width = img.naturalWidth;
				this.dom.canvas.height = img.naturalHeight;
				this.update();
			})
			.catch(e => {
				if(this.dom?.status){
					this.dom.status.textContent = e.toString();
				}
			});
	}
	set edges(val) {
		this.#edges = val.trim();
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