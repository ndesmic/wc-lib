function squareGradient(stopDimensions, values) {

	let currentStop = null;  

	for(let i = 0; i < values.length; i++){
		let stopIndex = 0;
		while (stopDimensions[i][stopIndex + 1][4] < values[i]) {
			stopIndex++;
		}

		const remainder = values[i] - stopDimensions[i][stopIndex][4];
		const stopFraction = remainder / (stopDimensions[i][stopIndex + 1][4] - stopDimensions[i][stopIndex][4]);

		if(!currentStop){
			currentStop = lerp(stopDimensions[i][stopIndex], stopDimensions[i][stopIndex + 1], stopFraction);
		} else {
			currentStop = add(currentStop, lerp(stopDimensions[i][stopIndex], stopDimensions[i][stopIndex + 1], stopFraction));
		}
	}

	return currentStop;
}

function lerp(pointA, pointB, normalValue){
	return [
		pointA[0] + (pointB[0] - pointA[0]) * normalValue,
		pointA[1] + (pointB[1] - pointA[1]) * normalValue,
		pointA[2] + (pointB[2] - pointA[2]) * normalValue,
		pointA[3] + (pointB[3] - pointA[3]) * normalValue,
	];
}

function add(a,b){
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2],
		a[3] + b[3],
	];
}

function validateStopDimensions(stopDimensions){
	for(const stops of stopDimensions){
		validateStops(stops);
	}
	return stopDimensions;
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

export class WcSquareGradient extends HTMLElement {
	#stops = [];
	static observedAttributes = ["stops",];
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
            </style>
			<canvas height="400" width="400" style="height: 400px; width: 400px"></canvas>
        `;
	}
	renderGradient() {
		const context = this.dom.canvas.getContext("2d");
		const imageData = context.getImageData(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		for (let i = 0; i < this.dom.canvas.width; i++) {
			for(let j = 0; j < this.dom.canvas.height; j++){
				const color = squareGradient(this.#stops, [
					(1.0 / this.dom.canvas.width) * i,
					(1.0 / this.dom.canvas.height) * j,
				]);
				imageData.data[(j * this.dom.canvas.width * 4) + 4 * i] = color[0] * 255;
				imageData.data[(j * this.dom.canvas.width * 4) + (4 * i) + 1] = color[1] * 255;
				imageData.data[(j * this.dom.canvas.width * 4) + (4 * i) + 2] = color[2] * 255;
				imageData.data[(j * this.dom.canvas.width * 4) + (4 * i) + 3] = color[3] * 255;
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
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
	set stops(val) {
		if (val.startsWith("#")) {
			this.#stops = validateStopDimensions(val.split(",").map(x => {
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
			this.#stops = validateStopDimensions(JSON.parse(val));
		}
	}
}

customElements.define("wc-square-gradient", WcSquareGradient);
