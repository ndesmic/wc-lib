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

	try {
	return [
		0.5 * ((p0[0] * q0) + (p1[0] * q1) + (p2[0] * q2) + (p3[0] * q3)),
		0.5 * ((p0[1] * q0) + (p1[1] * q1) + (p2[1] * q2) + (p3[1] * q3)),
	];
} catch(ex){
	console.log(ex);
}
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
	#points = [];
	static observedAttributes = ["height", "width", "points"];
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
				canvas { border: 1px solid black; }
            </style>
			<canvas height="${this.#height}" width="${this.#width}" style="height: ${this.#height}px; width: ${this.#width}px;"></canvas>
        `;
	}
	renderSpline() {
		const context = this.dom.canvas.getContext("2d");

		context.fillStyle = "#ff0000";
		context.strokeStyle = "transparent";
		context.lineWidth = 0;
		for (const p of this.#points) {
			context.beginPath();
			context.arc(p[0], this.dom.canvas.height - p[1], 3, 0, 2 * Math.PI);
			context.fill();
		}

		/*
		context.fillStyle = "#0000ff";
		for (let i = 0; i < this.#points.length - 3; i += 0.001) {
			const [x, y] = catmullRomSpline(this.#points, i);
			context.fillRect(x, this.dom.canvas.height - y, 1, 1);
		}
		*/

		context.fillStyle = "#cc00ff";
		const normalCurve = normalizeCurve(catmullRomSpline.bind(null, this.#points), this.#points.length - 3, 0.001);
		for (let i = 0; i < 1; i += 0.001) {
			const [x, y] = normalCurve(i);
			context.fillRect(x, this.dom.canvas.height - y, 1, 1);
		}

		/*
		context.strokeStyle = "#ff00ff";
		context.lineWidth = 1;
		context.beginPath();
		const approximatePoints = approximateCurve(catmullRomSpline.bind(null, this.#points), this.#points.length - 3, 0.01);
		context.moveTo(approximatePoints[0][0], this.dom.canvas.height - approximatePoints[0][1]);
		for(let i = 1; i < approximatePoints.length; i++){
			context.lineTo(approximatePoints[i][0], this.dom.canvas.height - approximatePoints[i][1]);
		}
		context.stroke();
		*/

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
	set points(val){
		this.#points = JSON.parse(val);
	}
}

customElements.define("wc-cr-spline", WcCrSpline);
