import * as Matrix from "./matrix.js";

function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

export class WcJsShaderCanvas extends HTMLElement {
	#image;
	#height = 240;
	#width = 320;
	#context;
	#mod;
	#globals;

	static observedAttributes = ["image", "height", "width", "src", "globals"];
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
			</style>
            <canvas width="${this.#width}px" height="${this.#height}px"></canvas>
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
		const program = this.#mod
			? this.#mod.default
			: this.textContent.trim() !== ""
				? new Function(["color", "Matrix", "Globals"], this.textContent)
				: null;

		if (!program || !this.#context) return;
		this.#context.clearRect(0, 0, this.#width, this.#height);
		if (this.#image) {
			this.#context.drawImage(this.#image, 0, 0, this.#width, this.#height);
		}

		const imageData = this.#context.getImageData(0, 0, this.#width, this.#height);
		let i = 0;
		while (i < imageData.data.length) {
			const data = imageData.data;
			const pixel = program([
				data[i] / 255,
				data[i + 1] / 255,
				data[i + 2] / 255,
				data[i + 3] / 255,
			], Matrix, this.#globals);
			data[i] = Math.floor(pixel[0] * 255);
			data[i + 1] = Math.floor(pixel[1] * 255);
			data[i + 2] = Math.floor(pixel[2] * 255);
			data[i + 3] = Math.floor(pixel[3] * 255);
			i += 4;
		}
		this.#context.putImageData(imageData, 0, 0);
	}
	set image(val) {
		loadImage(val)
			.then(img => {
				this.#image = img;
				this.update();
			});
	}
	set src(val) {
		import(val)
			.then(mod => {
				this.#mod = mod;
				this.update();
			});
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
	set globals(val) {
		val = typeof (val) === "object" ? val : JSON.parse(val);
		this.#globals = val;
		this.update();
	}
}

customElements.define("wc-js-shader-canvas", WcJsShaderCanvas);