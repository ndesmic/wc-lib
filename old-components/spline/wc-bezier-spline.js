function factorial(n){
	if(n < 0) throw new Error(`Cannot get factorial of negative number: ${n}`);
	if(n === 0) return 1;
	let result = n;
	for(let i = 1; i < n; i++){
		result *= n - i;
	}
	return result;
}

function combinations(n, k){
	return factorial(n) / (factorial(k) * factorial(n - k));
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

function inRadius(x, y, r, tx, ty) {
	return Math.sqrt((x - tx) ** 2 + (y - ty) ** 2) <= r;
}

function pointsToSegments(points){
	if(points.length < 2) throw new Error(`need at least 3 points`);

	const segs = [];

	for(let i = 1; i < points.length; i++){
		segs.push([points[i - 1], points[i]]); 
	}

	return segs;
}

function bezierSpline(points, t){
	const dimensions = points[0].length;
	const n = points.length - 1;
	const result = new Array(dimensions);
	for(let d = 0; d < dimensions; d++){
		let dimensionResult = 0;
		for(let i = 0; i < points.length; i++){
			dimensionResult += combinations(n,i) * ((1 - t) ** (n - i)) * (t ** i) * points[i][d];
		}
		result[d] = dimensionResult;
	}
	return result;
}

function rationalBezierSpline(points, t) {
	const dimensions = points[0].length - 1;
	const n = points.length - 1;
	const result = new Array(dimensions);
	for (let d = 0; d < dimensions; d++) {
		let dimensionResult = 0;
		let dimensionWeight = 0;
		for (let i = 0; i < points.length; i++) {
			const weight = combinations(n, i) * ((1 - t) ** (n - i)) * (t ** i) * points[i][dimensions];
			dimensionResult += weight * points[i][d];
			dimensionWeight += weight;
		}
		result[d] = dimensionResult / dimensionWeight;
	}
	return result;
}

function lerp(pointA, pointB, normalValue) {
	const result = [];
	for(let d = 0; d < pointA.length; d++){
		result.push(pointA[d] + (pointB[d] - pointA[d]) * normalValue)
	}
	return result;
}


function bezierSplineCasteljau(points, t){
	const segs = pointsToSegments(points);
	const values = segs.map(seg => lerp(seg[0], seg[1], t));
	if(values.length === 1) return values[0];
	return bezierSplineCasteljau(values, t);
}

function hexFromFloat(color) {
	return "#" + color.map(c => (c * 255).toString(16).padStart(2, "0")).join("");
}

export class WcBezierSpline extends HTMLElement {
	#height = 480;
	#width = 640;
	#color = [1, 0, 1];
	#points = [];
	#editable = false;
	
	#selectedIndex;
	#lastPointer;
	#currentOffset;
	#selectedPoint;

	static observedAttributes = ["height", "width", "points", "color", "editable"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
		this.onPointerDown = this.onPointerDown.bind(element);
		this.onPointerMove = this.onPointerMove.bind(element);
		this.onPointerUp = this.onPointerUp.bind(element);
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

		//draw background
		context.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

		//draw points
		context.fillStyle = "#ff0000";
		context.strokeStyle = "transparent";
		context.lineWidth = 0;
		for (const p of this.#points) {
			context.beginPath();
			context.arc(p[0], this.dom.canvas.height - p[1], 3, 0, 2 * Math.PI);
			context.fill();
		}

		//draw curve
		context.fillStyle = hexFromFloat(this.#color);

		if(this.#points[0].length === 2){
			for (let t = 0; t <= 1; t += 0.001) {
				const [x, y] = bezierSplineCasteljau(this.#points, t);
				context.fillRect(x, this.dom.canvas.height - y, 1, 1);
			}
		} else {
			for (let t = 0; t <= 1; t += 0.001) {
				const [x, y] = rationalBezierSpline(this.#points, t);
				context.fillRect(x, this.dom.canvas.height - y, 1, 1);
			}
		}
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
		if (this.#editable) {
			this.dom.canvas.addEventListener("pointerdown", this.onPointerDown)
		}
	}
	onPointerDown(e) {
		const rect = this.dom.canvas.getBoundingClientRect();
		this.#lastPointer = [
			e.offsetX,
			rect.height - e.offsetY
		];
		this.#selectedIndex = this.#points.findIndex(p => inRadius(this.#lastPointer[0], this.#lastPointer[1], 4, p[0], p[1]));

		if (this.#selectedIndex > -1) {
			this.#selectedPoint = [
				this.#points[this.#selectedIndex][0],
				this.#points[this.#selectedIndex][1]
			];
			this.dom.canvas.setPointerCapture(e.pointerId);
			this.dom.canvas.addEventListener("pointermove", this.onPointerMove);
			this.dom.canvas.addEventListener("pointerup", this.onPointerUp);
		}
	}
	onPointerMove(e) {
		const rect = this.dom.canvas.getBoundingClientRect();
		const currentPointer = [
			e.offsetX,
			rect.height - e.offsetY
		];
		this.#currentOffset = [
			currentPointer[0] - this.#lastPointer[0],
			this.#lastPointer[1] - currentPointer[1]
		];

		this.#points[this.#selectedIndex] = [
			this.#selectedPoint[0] + this.#currentOffset[0],
			this.#selectedPoint[1] - this.#currentOffset[1]
		];

		this.renderSpline();
	}
	onPointerUp(e) {
		this.#points[this.#selectedIndex] = [
			this.#selectedPoint[0] + this.#currentOffset[0],
			this.#selectedPoint[1] - this.#currentOffset[1]
		];
		this.renderSpline();
		this.dom.canvas.removeEventListener("pointermove", this.onPointerMove);
		this.dom.canvas.removeEventListener("pointerup", this.onPointerUp);
		this.dom.canvas.releasePointerCapture(e.pointerId);
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
	set color(val) {
		this.#color = parseColor(val);
	}
	set editable(val) {
		this.#editable = val !== undefined;
	}
}

customElements.define("wc-bezier-spline", WcBezierSpline);
