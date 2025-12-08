export function polarToCartesian(r, theta, cx = 0, cy = 0) {
	return [r * Math.cos(theta) + cx, r * Math.sin(theta) + cy];
}

function degreesToRadians(deg) {
	return deg * (Math.PI / 180);
}

export function writePixelRect(imageData, x, y, color, width = 1, height = 1){
	const offsetX = Math.floor(width / 2);
	const offsetY = Math.floor(height / 2);
	for(let i = 0; i < width; i++){
		for(let j = 0; j < height; j++){
			writePixel(imageData, x + i - offsetX, y + j - offsetY, color);
		}
	}
}
export function writePixel(imageData, x, y, color){
	const index = (imageData.width * 4 * y) + (x * 4);
	imageData.data[index] = color[0] * 255; 
	imageData.data[index + 1] = color[1] * 255; 
	imageData.data[index + 2] = color[2] * 255; 
	imageData.data[index + 3] = color[3] * 255; 
}

function parseColor(val) {
	const trimmedVal = val.trim();
	if (trimmedVal.startsWith("#")) {
		const hex = trimmedVal.trim().slice(1);
		return [
			parseInt(hex.substring(0, 2), 16) / 255,
			parseInt(hex.substring(2, 4), 16) / 255,
			parseInt(hex.substring(4, 6), 16) / 255,
			hex.length < 8 ? 1 : parseInt(hex.substring(6, 8), 16) / 255
		];
	} else if (trimmedVal.startsWith("[")) {
		return JSON.parse(trimmedVal);
	}
}

function hexFromFloat(color) {
	return "#" + color.map(c => (c * 255).toString(16).padStart(2, "0")).join("");
}

const TWO_PI = Math.PI * 2;
export function normalizeAngle(angle) {
	if (angle < 0) {
		return TWO_PI - (Math.abs(angle) % TWO_PI);
	}
	return angle % TWO_PI;
}

function rotate(position, angle) {
	return [
		Math.cos(angle) * position[0] - Math.sin(angle) * position[1],
		Math.sin(angle) * position[0] + Math.cos(angle) * position[1]
	];
}

export class WcSuperellipse extends HTMLElement {
	#height = 200;
	#width = 200;
	#cx;
	#cy;
	#r = 100;
	#rx = 100;
	#ry = 100;
	#p = 1;
	#angle = 0;
	#precision = 0.01; 
	#color = [1,0,0,1];
	#thickness = 1;
	static observedAttributes = ["height", "width", "cx", "cy", "r", "rx", "ry", "p", "angle", "precision", "color", "thickness"];
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
			<canvas height="${this.#height}" width="${this.#width}" style="height: ${this.#height}px; width: ${this.#width}px; border: 1px solid black;"></canvas>
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

		if(this.#precision > 0){
			context.fillStyle = hexFromFloat(this.#color);
			const ht = this.#thickness / 2;
			for(let t = 0; t < Math.PI * 2; t += this.#precision){
				const angle = normalizeAngle(t + this.#angle);
				const r = (this.#rx * this.#ry) / (Math.abs(this.#ry * Math.cos(angle)) ** this.#p + Math.abs(this.#rx * Math.sin(angle)) ** this.#p ) ** (1/this.#p);
				const [x,y] = polarToCartesian(r, t, this.#cx, this.#cy);
				context.fillRect(x-ht,y+ht,this.#thickness,this.#thickness);
			}
		} else {
			for(let i = this.#cx - this.#r; i < this.#cx + this.#r; i++){
				const x = i - this.#cx;
				const y = this.#ry * ((1 - Math.abs(x / this.#rx) ** this.#p) ** (1/this.#p));
				const [tx,ty] = rotate([x,y], this.#angle, this.#cx, this.#cy).map(x => Math.floor(x));
				const [tx2, ty2] = rotate([x, -y], this.#angle, this.#cx, this.#cy).map(x => Math.floor(x));
				writePixelRect(imageData, tx - this.#cx, this.#cy - ty, this.#color, this.#thickness, this.#thickness);
				writePixelRect(imageData, tx2 - this.#cx, this.#cy - ty2, this.#color, this.#thickness, this.#thickness);
			}
			for (let i = this.#cx - this.#r; i < this.#cy + this.#r; i++) {
				const y = i - this.#cx;
				const x = Math.floor(this.#rx * ((1 - Math.abs(y / this.#ry) ** this.#p) ** (1 / this.#p)))
				const [tx, ty] = rotate([x, y], this.#angle, this.#cx, this.#cy).map(x => Math.floor(x));
				const [tx2, ty2] = rotate([-x, y], this.#angle, this.#cx, this.#cy).map(x => Math.floor(x));
				writePixelRect(imageData, tx - this.#cx, this.#cy - ty, this.#color, this.#thickness, this.#thickness);
				writePixelRect(imageData, tx2 - this.#cx, this.#cy - ty2, this.#color, this.#thickness, this.#thickness);
			}
			context.putImageData(imageData, 0, 0);
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
		this.#rx = this.#r;
		this.#ry = this.#r;
	}
	set rx(val){
		this.#rx = parseFloat(val);
	}
	set ry(val){
		this.#ry = parseFloat(val);
	}
	set p(val){
		this.#p = parseFloat(val);
	}
	set precision(val){
		this.#precision = val === "pixel" ? 0 : parseFloat(val);
	}
	set color(val){
		this.#color = parseColor(val);
	}
	set thickness(val){
		this.#thickness = parseInt(val);
	}
	set angle(val){
		this.#angle = degreesToRadians(parseFloat(val));
		this.renderSquircle();
	}
}

customElements.define("wc-superellipse", WcSuperellipse);
