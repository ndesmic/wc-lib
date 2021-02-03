function basisSpline(){

}

export class WcBSpline extends HTMLElement {
	#height = 480;
	#width = 640;
	#points = [];
	static observedAttributes = ["height", "width", "points"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
				}
				canvas { border: 1px solid black; }
            </style>
			<canvas height="${this.#height}" width="${this.#width}" style="height: ${this.#height}px; width: ${this.#width}px;"></canvas>
        `;
	}
	renderSpline() {
		const context = this.dom.canvas.getContext("2d");

		for (const p of this.#points) {
			context.fillStyle = "#ff0000";
			context.beginPath();
			context.arc(p[0], this.dom.canvas.height - p[1], 2, 0, 2 * Math.PI);
			context.fill();
		}

		/*
		const imageData = context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		for (let i = 0; i < imageData.width; i++) {
			for (let j = 0; j < imageData.height; j++) {
				const x = i;
				const y = imageData.height - j;
			}
		}
		*/


		context.putImageData(imageData, 0, 0);
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.renderSpline();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas")
		};
	}
	attachEvents() {
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
	set width(val) {
		this.#width = parseFloat(val);
	}
	set height(val) {
		this.#height = parseFloat(val);
	}
	set points(val) {
		this.#points = JSON.parse(val);
	}
}

customElements.define("wc-b-spline", WcBSpline);
