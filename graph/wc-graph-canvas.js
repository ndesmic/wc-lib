function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function imageToCanvas(image) {
	const canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);
	return canvas;
}

let lastDpr = window.devicePixelRatio;
let id = 0;

const worker = new Worker("./wc-graph-canvas-worker.js");

class WcGraphCanvas extends HTMLElement {
	#points = [];
	#width = 320;
	#height = 240;
	#xmax = 100;
	#xmin = -100;
	#ymax = 100;
	#ymin = -100;
	#func;
	#step = 1;
	#thickness = 1;
	#continuous = false;
	#id;

	#defaultShape = "circle";
	#defaultSize = 2;
	#defaultColor = "#F00"

	static observedAttributes = ["points", "func", "step", "width", "height", "xmin", "xmax", "ymin", "ymax", "default-shape", "default-size", "default-color", "continuous", "thickness"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents.bind(element);
	}
	connectedCallback() {
		this.#id = id++;
		this.attachShadow({ mode: "open" });
		this.canvas = document.createElement("canvas");
		this.shadowRoot.appendChild(this.canvas);
		const dpr  = window.devicePixelRatio;
		this.canvas.height = this.#height * dpr;
		this.canvas.width = this.#width * dpr;
		this.canvas.style.height = this.#height + "px";
		this.canvas.style.width = this.#width + "px";

		this.context = this.canvas.getContext("2d");
		this.context.scale(dpr, dpr);

		this.willRender();
		this.attachEvents();
	}
	willRender(){
		if(!this.context) return;
		worker.postMessage({
			points: this.#points,
			xmax: this.#xmax,
			ymax: this.#ymax,
			xmin: this.#xmin,
			ymin: this.#ymin,
			step: this.#step,
			func: this.#func,
			width: this.#width,
			height: this.#height,
			defaultColor: this.#defaultColor,
			defaultSize: this.#defaultSize,
			defaultShape: this.#defaultShape,
			continuous: this.#continuous,
			thickness: this.#thickness,
			devicePixelRatio: window.devicePixelRatio,
			recipientId: this.#id
		});
	}
	render(image){
		this.canvas.height = this.#height * window.devicePixelRatio;
		this.canvas.width = this.#width * window.devicePixelRatio;
		this.context.clearRect(0,0,this.#width * window.devicePixelRatio, this.#height * window.devicePixelRatio);
		this.context.drawImage(image, 0, 0);
	}
	attachEvents() {
		worker.addEventListener("message", e => {
			if(e.data.recipientId === this.#id){
				this.render(e.data.image)
			}
		});
		window.addEventListener("resize", () => {
			const dpr = window.devicePixelRatio;
			if(lastDpr !== dpr){
				lastDpr = dpr;
				this.willRender();
			}
		});
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[hyphenCaseToCamelCase(name)] = newValue;
	}
	set points(value) {
		if (typeof (value) === "string") {
			value = JSON.parse(value);
		}

		value = value.map(p => ({
			x: p[0],
			y: p[1],
			color: p[2] ?? this.#defaultColor,
			size: p[3] ?? this.#defaultSize,
			shape: p[4] ?? this.#defaultShape
		}));

		this.#points = value;

		this.willRender();
	}
	get points() {
		return this.#points;
	}
	set width(value) {
		this.#width = parseFloat(value);
	}
	get width() {
		return this.#width;
	}
	set height(value) {
		this.#height = parseFloat(value);
	}
	get height() {
		return this.#height;
	}
	set xmax(value) {
		this.#xmax = parseFloat(value);
	}
	get xmax() {
		return this.#xmax;
	}
	set xmin(value) {
		this.#xmin = parseFloat(value);
	}
	get xmin() {
		return this.#xmin;
	}
	set ymax(value) {
		this.#ymax = parseFloat(value);
	}
	get ymax() {
		return this.#ymax;
	}
	set ymin(value) {
		this.#ymin = parseFloat(value);
	}
	get ymin() {
		return this.#ymin;
	}
	set func(value) {
		this.#func = value;
	}
	set step(value) {
		this.#step = parseFloat(value);
	}
	set defaultSize(value) {
		this.#defaultSize = parseFloat(value);
	}
	set defaultShape(value) {
		this.#defaultShape = value;
	}
	set defaultColor(value) {
		this.#defaultColor = value;
	}
	set continuous(value) {
		this.#continuous = value !== undefined;
	}
	set thickness(value) {
		this.#thickness = parseFloat(value);
	}
}

customElements.define("wc-graph-canvas", WcGraphCanvas);
