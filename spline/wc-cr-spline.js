function catmullRomSpline(points, t) {
	const i = Math.floor(t);
	const p0 = points[i];
	const p1 = points[i + 1];
	const p2 = points[i + 2];
	const p3 = points[i + 3];

	if(points.length <= i + 3){ //out of bounds then clamp
		return points[points.length - 2];
	}

	const remainderT = t - i;

	const q0 = (-1 * remainderT ** 3) + (2 * remainderT ** 2) + (-1 * remainderT);
	const q1 = (3 * remainderT ** 3) + (-5 * remainderT ** 2) + 2;
	const q2 = (-3 * remainderT ** 3) + (4 * remainderT ** 2) + remainderT;
	const q3 = remainderT ** 3 - remainderT ** 2;

	return [
		0.5 * ((p0[0] * q0) + (p1[0] * q1) + (p2[0] * q2) + (p3[0] * q3)),
		0.5 * ((p0[1] * q0) + (p1[1] * q1) + (p2[1] * q2) + (p3[1] * q3)),
	];
}

function catmullRomGradient(points, t){
	const i = Math.floor(t);
	const p0 = points[i];
	const p1 = points[i + 1];
	const p2 = points[i + 2];
	const p3 = points[i + 3];

	if (points.length <= i + 3) { //out of bounds then clamp
		return points[points.length - 2];
	}

	const remainderT = t - i;

	const q0 = (-3 * remainderT ** 2) + (4 * remainderT) -1;
	const q1 = (9 * remainderT ** 2) + (-10 * remainderT);
	const q2 = (-9 * remainderT ** 2) + (8 * remainderT) + 1;
	const q3 = (3 * remainderT ** 2) - (2 * remainderT);

	return [
		0.5 * ((p0[0] * q0) + (p1[0] * q1) + (p2[0] * q2) + (p3[0] * q3)),
		0.5 * ((p0[1] * q0) + (p1[1] * q1) + (p2[1] * q2) + (p3[1] * q3)),
	];
}

function parseColor(val){
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

function hexFromFloat(color){
	return "#" + color.map(c => (c * 255).toString(16).padStart(2, "0")).join("");
}

function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}


function inRadius(x,y,r, tx,ty){
	return Math.sqrt((x - tx)**2 + (y - ty)**2) <= r;
}

function approximateCurve(curveFunction, min, max, delta){
	const points = [];
	for(let t = min; t <= max; t += delta){
		points.push(curveFunction(t));
	}
	return points;
}

function measureSegments(segs){
	const lengths = [0]; //first point is always at position 0
	let lastPoint = segs[0];
	for(let i = 1; i < segs.length; i++){
		const currentPoint = segs[i];
		lengths.push(Math.sqrt((currentPoint[0] - lastPoint[0])**2 + (currentPoint[1] - lastPoint[1])**2));
		lastPoint = currentPoint;
	}
	return lengths;
}

function normalizeCurve(curveFunc, max, delta){
	const segmentLengths = [0]; //first point is always position 0
	for(let i = 1; i <= max; i++){
		const approximatePoints = approximateCurve(curveFunc, i - 1, i, delta);
		const approximationSegmentLengths = measureSegments(approximatePoints);
		const length = approximationSegmentLengths.reduce((sum, l) => sum + l, 0);
		segmentLengths.push(length);
	}
	const maxLength = segmentLengths.reduce((sum, l) => sum + l, 0);

	return function(t){
		if(t < 0){
			return curveFunc(0);
		} else if (t > 1){
			return curveFunc(1);
		}

		const currentLength = t * maxLength;
		let totalSegmentLength = 0;
		let segmentIndex = 0;
		while(currentLength > totalSegmentLength + segmentLengths[segmentIndex + 1]){
			segmentIndex++;
			totalSegmentLength += segmentLengths[segmentIndex];
		}

		const segmentLength = segmentLengths[segmentIndex + 1];
		const remainderLength = currentLength - totalSegmentLength;
		const fractionalRemainder = remainderLength / segmentLength;
		return curveFunc(segmentIndex + fractionalRemainder);
	}
}

export class WcCrSpline extends HTMLElement {
	#height = 480;
	#width = 640;
	#editable = false;
	#color = [1,0,1];
	#points = [];
	#approximate = null;
	#approximateColor = [0,1,0];
	#lastPointerX;
	#lastPointerY;
	#currentOffsetX;
	#currentOffsetY;
	#selectedIndex;
	#selectedPointX;
	#selectedPointY;
	static observedAttributes = ["height", "width", "points", "color", "editable", "approximate", "approximate-color"];
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
		const normalCurve = normalizeCurve(catmullRomSpline.bind(null, this.#points), this.#points.length - 3, 0.001);
		for (let i = 0; i < 1; i += 0.001) {
			const [x, y] = normalCurve(i);
			context.fillRect(x, this.dom.canvas.height - y, 1, 1);
		}

		//draw approximation
		if(this.#approximate){
			context.strokeStyle = hexFromFloat(this.#approximateColor);
			context.lineWidth = 1;
			context.beginPath();
			const approximatePoints = approximateCurve(catmullRomSpline.bind(null, this.#points), 0, this.#points.length - 2, (this.#points.length - 3) / this.#approximate);
			context.moveTo(approximatePoints[0][0], this.dom.canvas.height - approximatePoints[0][1]);
			for(let i = 1; i < approximatePoints.length; i++){
				context.lineTo(approximatePoints[i][0], this.dom.canvas.height - approximatePoints[i][1]);
			}
			context.stroke();
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
		if(this.#editable){
			this.dom.canvas.addEventListener("pointerdown", this.onPointerDown);
		}
	}
	onPointerDown(e){
		const rect = this.dom.canvas.getBoundingClientRect();
		this.#lastPointerX = e.offsetX;
		this.#lastPointerY = rect.height - e.offsetY;
		this.#selectedIndex = this.#points.findIndex(p => inRadius(this.#lastPointerX, this.#lastPointerY, 4, p[0], p[1]));

		if(this.#selectedIndex > -1){
			console.log("Got Index", this.#selectedIndex);
			this.#selectedPointX = this.#points[this.#selectedIndex][0];
			this.#selectedPointY = this.#points[this.#selectedIndex][1];
			this.dom.canvas.addEventListener("pointermove", this.onPointerMove);
			this.dom.canvas.addEventListener("pointerup", this.onPointerUp);
			this.dom.canvas.removeEventListener("pointerdown", this.onPointerDown);
		}
	}
	onPointerMove(e){
		const rect = this.dom.canvas.getBoundingClientRect();
		const currentPointerX = e.offsetX;
		const currentPointerY = rect.height - e.offsetY;
		this.#currentOffsetX = currentPointerX - this.#lastPointerX;
		this.#currentOffsetY = this.#lastPointerY - currentPointerY;
		console.log("X", this.#currentOffsetX, "Y", this.#currentOffsetY);

		const selectedPoint = this.#points[this.#selectedIndex];
		selectedPoint[0] = this.#selectedPointX + this.#currentOffsetX;
		selectedPoint[1] = this.#selectedPointY - this.#currentOffsetY;
		this.renderSpline();
	}
	onPointerUp(e){
		const selectedPoint = this.#points[this.#selectedIndex];
		selectedPoint[0] = this.#selectedPointX + this.#currentOffsetX;
		selectedPoint[1] = this.#selectedPointY - this.#currentOffsetY;
		this.renderSpline();
		this.dom.canvas.removeEventListener("pointermove", this.onPointerMove);
		this.dom.canvas.removeEventListener("pointerup", this.onPointerUp);
		this.dom.canvas.addEventListener("pointerdown", this.onPointerDown);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[hyphenCaseToCamelCase(name)] = newValue;
	}
	set width(val) {
		this.#width = parseFloat(val);
	}
	set height(val) {
		this.#height = parseFloat(val);
	}
	set editable(val){
		this.#editable = val !== undefined; 
	}
	set approximate(val){
		this.#approximate = parseInt(val);
	}
	set points(val){
		this.#points = JSON.parse(val);
	}
	set color(val){
		this.#color = parseColor(val);
	}
	set approximateColor(val){
		this.#approximateColor = parseColor(val);
	}
}

customElements.define("wc-cr-spline", WcCrSpline);
