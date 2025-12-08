function degreesToRadians(deg) {
	return deg * (Math.PI / 180);
}

function translate(position, x, y){
	return [
		position[0] + x,
		position[1] + y
	]
}

function rotate(position, angle){
	return [
		Math.cos(angle) * position[0] - Math.sin(angle) * position[1],
		Math.sin(angle) * position[0] + Math.cos(angle) * position[1]
	];
}

function scale(position, sx = 1, sy = 1){
	return [
		position[0] * sx,
		position[1] * sy
	];
}

function linearGradient(stops, value) {
	if(value > 1){ 
		return stops[stops.length - 1].slice(0, 4);
	}
	if(value < 0) {
		return stops[0].slice(0,4);
	}
	let stopIndex = 0;
	while(stops[stopIndex + 1][4] < value){
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

function validateStops(colors){
	if(colors.length < 2) throw "Gradient requires at least 2 colors";
	for(const color of colors){
		if(color.length === 3) color.push(1);
		for(const component of color){
			if(component < 0 || component > 1) throw `Color stop has out of range component: ${component}`;
		}
	}
	if(colors.every(color => color.length === 4)){
		const stopLength = 1 / (colors.length - 1);
		colors.forEach((color, i) => color.push(i * stopLength))
	}
	if(colors.some(color => color.length === 4)){
		throw "Colors must either all have positions, or none have positions";
	}
	if(colors[0][4] !== 0){
		throw "First color must start at position 0";
	}
	if(colors[colors.length - 1][4] !== 1){
		throw "Last color must end at position 1";
	}
	let max = 0;
	for(const color of colors){
		if(color[4] >= max){
			max = color[4];
		} else {
			throw "Color stops are out of order";
		}
	}
	return colors;
}

export class WcLinearGradient extends HTMLElement {
	#stops = [];
	#height =  50;
	#width = 800;
	#angle = 0;
	#cx;
	#cy;
	#length;
	static observedAttributes = ["stops","height","width","angle", "cx", "cy", "length"];
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
			<canvas height="${this.#height}" width="${this.#width}" style="height: ${this.#height}px; width: ${this.#width}px;"></canvas>
        `;
	}
	renderGradient(){
		const context = this.dom.canvas.getContext("2d");
		const imageData = context.getImageData(0,0,this.dom.canvas.width, this.dom.canvas.height);
		const mx = imageData.width / 2;
		const my = imageData.height / 2;
		const cx = this.#cx ?? mx;
		const cy = this.#cy ?? my;
		const cxOffset = cx - mx;
		const cyOffset = cy - my;
		const length = this.#length ?? imageData.width;
		for(let i =0; i < imageData.width; i++){
			for(let j = 0; j < imageData.height; j++){
				const [x, y] = translate(translate(rotate(scale(translate([i, j], -mx, -my), imageData.width/length, 1), this.#angle), cxOffset, cyOffset), mx, my);
				const color = linearGradient(this.#stops, ((1.0 / imageData.width) * x));
				imageData.data[(j * imageData.width * 4) + 4 * i] = color[0] * 255;
				imageData.data[(j * imageData.width * 4) + (4 * i) + 1] = color[1] * 255;
				imageData.data[(j * imageData.width * 4) + (4 * i) + 2] = color[2] * 255;
				imageData.data[(j * imageData.width * 4) + (4 * i) + 3] = color[3] * 255;
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
		if(val.startsWith("#")){
			this.#stops = validateStops(val.split(",").map(x => {
				x = x.trim();
				if(x.startsWith("#")){
					const hex = x.trim().slice(1);
					return [
						parseInt(hex.substring(0,2), 16) / 255,
						parseInt(hex.substring(2,4), 16) / 255,
						parseInt(hex.substring(4,6), 16) / 255,
						hex.length < 8 ? 1 : parseInt(hex.substring(6,8), 16) / 255
					];
				}
			}));
		} else if (val.startsWith("[")){
			this.#stops = validateStops(JSON.parse(val));
		}
	}
	set width(val) {
		this.#width = parseFloat(val);
	}
	set height(val) {
		this.#height = parseFloat(val);
	}
	set angle(val){
		this.#angle = degreesToRadians(parseFloat(val));
	}
	set cx(val){
		this.#cx = parseFloat(val);
	}
	set cy(val){
		this.#cy = parseFloat(val);
	}
	set length(val){
		this.#length = parseFloat(val);
	}
}

customElements.define("wc-linear-gradient", WcLinearGradient);
