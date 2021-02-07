export function polarToCartesian(r, theta, cx = 0, cy = 0) {
	return [r * Math.cos(theta) + cx, r * Math.sin(theta) + cy];
}

export class WcSquircle extends HTMLElement {
	#height = 200;
	#width = 200;
	#cx;
	#cy;
	#r = 100;
	#p = 1;
	static observedAttributes = ["height", "width", "cx", "cy", "r", "p"];
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
		for(let t = 0; t < Math.PI * 2; t += 0.0001){
			const r = (this.#r * this.#r) / (Math.abs(this.#r * Math.cos(t)) ** this.#p + Math.abs(this.#r * Math.sin(t)) ** this.#p ) ** (1/this.#p);
			const [x,y] = polarToCartesian(r, t, this.#cx, this.#cy);
			context.fillRect(x-1,y-1,2,2);
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
	set p(val){
		this.#p = parseFloat(val);
	}
}

customElements.define("wc-squircle", WcSquircle);
