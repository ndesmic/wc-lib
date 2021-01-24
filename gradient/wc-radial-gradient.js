export function cartesianToPolar(x, y, cx = 0, cy = 0) {
	return [Math.sqrt((x - cx) ** 2 + (y - cy) ** 2), Math.atan((y - cy) / (x - cx))];
}

function linearGradient(stops, value) {
	let stopIndex = 0;
	while (stops[stopIndex + 1][4] < value) {
		stopIndex++;
	}

	const remainder = value - stops[stopIndex][4];
	const stopFraction = remainder / (stops[stopIndex + 1][4] - stops[stopIndex][4]);

	return lerp(stops[stopIndex], stops[stopIndex + 1], stopFraction);
}

function lerp(pointA, pointB, normalValue) {
	return [
		pointA[0] + (pointB[0] - pointA[0]) * normalValue,
		pointA[1] + (pointB[1] - pointA[1]) * normalValue,
		pointA[2] + (pointB[2] - pointA[2]) * normalValue,
		pointA[3] + (pointB[3] - pointA[3]) * normalValue,
	];
}

function validateStops(stops) {
	if (stops.length < 2) throw "Gradient requires at least 2 colors";
	for (const color of stops) {
		if (color.length === 3) color.push(1);
		for (const component of color) {
			if (component < 0 || component > 1) throw `Color stop has out of range component: ${component}`;
		}
	}
	if (stops.every(color => color.length === 4)) {
		const stopLength = 1 / (stops.length - 1);
		stops.forEach((color, i) => color.push(i * stopLength))
	}
	if (stops.some(color => color.length === 4)) {
		throw "Colors must either all have positions, or none have positions";
	}
	if (stops[0][4] !== 0) {
		throw "First color must start at position 0";
	}
	if (stops[stops.length - 1][4] !== 1) {
		throw "Last color must end at position 1";
	}
	let max = 0;
	for (const color of stops) {
		if (color[4] >= max) {
			max = color[4];
		} else {
			throw "Color stops are out of order";
		}
	}
	return stops;
}

export class WcRadialGradient extends HTMLElement {
	#stops = [];
	#cx;
	#cy;
	#r;
	#ob = "clamp";
	static observedAttributes = ["stops", "cx", "cy", "r", "ob"];
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
				input { display: none; }
            </style>
			<canvas height="400" width="400" style="height: 400px; width: 400px"></canvas>
			<input type="range">
        `;
	}
	renderGradient() {
		const context = this.dom.canvas.getContext("2d");
		const imageData = context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		for (let i = 0; i < imageData.width; i++) {
			for (let j = 0; j < imageData.height; j++) {
				const y = imageData.height - j; 
				const [r, _] = cartesianToPolar(i, y, this.#cx, this.#cy);
				let rValue = r / this.#r;
				if(this.#ob !== "clamp" && rValue > 1){
					imageData.data[(j * imageData.width * 4) + 4 * i] = this.#ob[0] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 1] = this.#ob[1] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 2] = this.#ob[2] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 3] = this.#ob[3] * 255;
				} else {
					rValue = Math.min(1.0, rValue);
					const color = linearGradient(this.#stops, rValue);
					imageData.data[(j * imageData.width * 4) + 4 * i] = color[0] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 1] = color[1] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 2] = color[2] * 255;
					imageData.data[(j * imageData.width * 4) + (4 * i) + 3] = color[3] * 255;
				}
			}
		}
		context.putImageData(imageData, 0, 0);
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.renderGradient();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			slider: this.shadowRoot.querySelector("input")
		};
	}
	attachEvents() {
		this.dom.slider.addEventListener("change", this.sliderChange);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
	set stops(val) {
		if (val.startsWith("#")) {
			this.#stops = validateStops(val.split(",").map(x => {
				x = x.trim();
				if (x.startsWith("#")) {
					const hex = x.trim().slice(1);
					return [
						parseInt(hex.substring(0, 2), 16) / 255,
						parseInt(hex.substring(2, 4), 16) / 255,
						parseInt(hex.substring(4, 6), 16) / 255,
						hex.length < 8 ? 1 : parseInt(hex.substring(6, 8), 16) / 255
					];
				}
			}));
		} else if (val.startsWith("[")) {
			this.#stops = validateStops(JSON.parse(val));
		}
	}
	set cx(val){
		this.#cx = parseFloat(val);
	}
	set cy(val){
		this.#cy = parseFloat(val);
	}
	set r(val){
		this.#r = parseFloat(val);
	}
	set ob(val){
		if(val === "clamp"){
			this.#ob = "clamp";
		} else if(val.startsWith("#")){
			const hex = val.trim().slice(1);
			this.#ob = [
				parseInt(hex.substring(0, 2), 16) / 255,
				parseInt(hex.substring(2, 4), 16) / 255,
				parseInt(hex.substring(4, 6), 16) / 255,
				hex.length < 8 ? 1 : parseInt(hex.substring(6, 8), 16) / 255
			];
		}
	}
}

customElements.define("wc-radial-gradient", WcRadialGradient);
