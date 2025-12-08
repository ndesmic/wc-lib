export function polarToCartesian(r, theta, cx = 0, cy = 0) {
	return [r * Math.cos(theta) + cx, r * Math.sin(theta) + cy];
}

export class WcRectangle extends HTMLElement {
	#height = 400;
	#width = 400;
	#cx;
	#cy;
	#r = 100;
	#cr = 0;
	static observedAttributes = ["height", "width", "cx", "cy", "r", "cr"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
		this.renderSquircle = this.renderSquircle.bind(element);
	}
	render(){
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
				}	
            </style>
			<canvas height="${this.#height}" width="${this.#width}" style="height: ${this.#height}px; width: ${this.#width}px;"></canvas>
        `;
	}
	renderSquircle() {
		const context = this.dom.canvas.getContext("2d");

		//draw background
		context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

		const imageData = context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);


		context.strokeStyle = "#ff0000";
		context.lineWidth = 2;
		//top
		context.moveTo(this.#cx, this.#cy - this.#r); //t
		context.arcTo(this.#cx + this.#r, this.#cy - this.#r, this.#cx + this.#r, this.#cy, this.#cr); //r
		context.arcTo(this.#cx + this.#r, this.#cy + this.#r, this.#cx, this.#cy + this.#r, this.#cr); //b
		context.arcTo(this.#cx - this.#r, this.#cy + this.#r, this.#cx - this.#r, this.#cy, this.#cr); //l
		context.arcTo(this.#cx - this.#r, this.#cy - this.#r, this.#cx, this.#cy - this.#r, this.#cr); //t
		context.lineTo(this.#cx, this.#cy - this.#r);

		context.textAlign = "center";
		context.font = "28px Arial";
		context.fillText("Not a Squircle", this.#cx, this.#cy, 200);

		context.stroke();
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.renderSquircle();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			slider: this.shadowRoot.querySelector("input")
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
	set cx(val) {
		this.#cx = parseInt(val);
	}
	set cy(val) {
		this.#cy = parseInt(val);
	}
	set r(val) {
		this.#r = parseFloat(val);
	}
	set cr(val){
		this.#cr = parseFloat(val);
	}
}

customElements.define("wc-rectangle", WcRectangle);
