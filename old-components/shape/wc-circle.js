export function polarToCartesian(r, theta, cx = 0, cy = 0) {
	return [r * Math.cos(theta) + cx, r * Math.sin(theta) + cy];
}

export class WcCircle extends HTMLElement {
	#height = 400;
	#width = 400;
	#cx;
	#cy;
	#r = 50;
	static observedAttributes = ["height", "width", "cx", "cy", "r"];
	constructor() {
		super();
		this.bind(this);
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
	bind(element) {
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
		this.renderSquircle = this.renderSquircle.bind(element);
	}
	renderSquircle(){
		const context = this.dom.canvas.getContext("2d");
		
		//draw background
		context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

		const imageData = context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);


		context.fillStyle = "#ff0000";
		for(let t = 0; t < Math.PI * 2; t += 0.01){
			const [x,y] = polarToCartesian(this.#r, t, this.#cx, this.#cy);
			context.fillRect(x,y,1,1);
		}
	}
	connectedCallback() {
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
	set cx(val){
		this.#cx = parseInt(val);
	}
	set cy(val){
		this.#cy = parseInt(val);
	}
	set r(val){
		this.#r = parseFloat(val);
	}
}

customElements.define("wc-circle", WcCircle);
