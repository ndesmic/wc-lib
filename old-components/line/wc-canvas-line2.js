function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function getVectorMagnitude(vec) {
	return Math.sqrt(vec.reduce((sum, x) => sum + x ** 2, 0));
}

function divideVector(vec, s) {
	return vec.map(x => x / s);
}

function subtractVector(a, b) {
	return a.map((x, i) => x - b[i]);
}

function addVector(a, b) {
	return a.map((x, i) => x + b[i]);
}

function normalizeVector(vec) {
	return divideVector(vec, getVectorMagnitude(vec));
}

function negateVector(vec) {
	return vec.map(x => x * -1);
}

function dotVector(a, b) {
	return a.reduce((sum, _, i) => sum + (a[i] * b[i]), 0);
}

export class WcCanvasLine extends HTMLElement {
	#height = 480;
	#width = 640;
	#points = [];
	#thickness = 1.0;

	static observedAttributes = ["height", "width", "points", "thickness"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.renderLine = this.renderLine.bind(element);
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
	renderLine() {
		if (!this.context) return;

		//Get the normal for each point as well as a tangent vector to the previous point
		const positions = [];
		const normals = [];
		const previousTangents = [];
		const nextTangents = [];
		const cornerDirections = [];
		//const miters = [];

		for (let i = 0; i < this.#points.length; i++) {
			const current = this.#points[i];
			const prev = this.#points[i - 1];
			const next = this.#points[i + 1];

			if (next && !prev) { //start of line
				const delta = normalizeVector(subtractVector(next, current));

				positions.push(
					current[0], current[1],
					current[0], current[1]
				);
				normals.push(
					delta[1], -delta[0],
					-delta[1], delta[0]
				);
				cornerDirections.push(
					-1,
					1
				);
				previousTangents.push(
					-delta[0], -delta[1],
					-delta[0], -delta[1] 
				);
				nextTangents.push(
					delta[0], delta[1],
					delta[0], delta[1]
				);
			} else if (prev && !next) { //end of line
				const delta = normalizeVector(subtractVector(current, prev));

				positions.push(
					current[0], current[1],
					current[0], current[1]
				);
				normals.push(
					delta[1], -delta[0],
					-delta[1], delta[0]
				);
				cornerDirections.push(
					-1,
					1
				);
				previousTangents.push(
					-delta[0], -delta[1],
					-delta[0], -delta[1]
				);
				nextTangents.push(
					delta[0], delta[1],
					delta[0], delta[1]
				);
			} else { //between lines
				const nextTangent = normalizeVector(subtractVector(next, current));
				const previousTangent = normalizeVector(subtractVector(prev, current));

				positions.push(
					current[0], current[1],
					current[0], current[1],
					current[0], current[1],
					current[0], current[1]
				);
				normals.push(
					-previousTangent[1], previousTangent[0], 
					previousTangent[1], -previousTangent[0],
					-previousTangent[1], previousTangent[0],
					previousTangent[1], -previousTangent[0]
				);
				cornerDirections.push(
					-1,
					1,
					-1,
					1
				); 
				previousTangents.push(
					previousTangent[0], previousTangent[1], 
					previousTangent[0], previousTangent[1],
					previousTangent[0], previousTangent[1],
					previousTangent[0], previousTangent[1]
				);
				nextTangents.push(
					nextTangent[0], nextTangent[1], 
					nextTangent[0], nextTangent[1],
					nextTangent[0], nextTangent[1],
					nextTangent[0], nextTangent[1]
				);
			}
		}

		this.context.lineWidth = 1;
		this.context.strokeStyle = "#000";
		this.context.fillStyle = "#000";

		let last = 0;
		let pointIndex = 0;
		const maxMiterLength = 25;

		for (let i = 0; i < positions.length; i += 2) {
			const position = [positions[i], positions[i + 1]];
			const normal = normalizeVector([normals[i], normals[i + 1]]);
			const previousTangent = normalizeVector([previousTangents[i], previousTangents[i + 1]]);
			const nextTangent = normalizeVector([nextTangents[i], nextTangents[i + 1]]);
			const cornerDirection = cornerDirections[i / 2];

			let normalMiter = normalizeVector(addVector(nextTangent, previousTangent));
			normalMiter = (isNaN(normalMiter[0]) || normalMiter[0] == Infinity) ? normal : normalMiter;

			const isOutsideEdge = dotVector(normal, normalMiter) < 0;

			//scale points to screen space
			const sx = ((position[0] + 1) / 2) * this.#width;
			const sy = this.#height - (((position[1] + 1) / 2) * this.#height);

			//miterDirection * scale
			const miterLength = 1 / dotVector(normal, normalMiter) * this.#thickness;
			let x;
			let y;
			
			if(Math.abs(miterLength) > maxMiterLength && isOutsideEdge) {
				const bevelDirection = normalizeVector(addVector(normalMiter, normal));
				const bevelLength = 1 / dotVector(normal, bevelDirection) * this.#thickness;
				x = sx + (bevelDirection[0] * bevelLength) * cornerDirection;
				y = sy + (bevelDirection[1] * bevelLength) * cornerDirection;
				//p = s + normalMiter + normal
			} else {
				x = sx + (normalMiter[0] * miterLength);
				y = sy - (normalMiter[1] * miterLength);
			}

			//draw triangle strip
			if (i === 0) {
				this.context.beginPath();
				this.context.moveTo(x, y);
			} else if (i < 4) {
				this.context.lineTo(x, y);
			} else {
				this.context.lineTo(x, y);
				this.context.closePath();
				this.context.stroke();
				this.context.beginPath();
				this.context.moveTo(last[0], last[1]);
				this.context.lineTo(x, y);
			}

			last = [x, y];
			pointIndex++;
		}

		this.context.strokeStyle = "#F00000";
		for (let i = 0; i < this.#points.length; i++) {
			const rawX = this.#points[i][0];
			const rawY = this.#points[i][1];
			const sx = ((rawX + 1) / 2) * this.#width;
			const sy = this.#height - (((rawY + 1) / 2) * this.#height);

			if (i === 0) {
				this.context.beginPath();
				this.context.moveTo(sx, sy);
			} else {
				this.context.lineTo(sx, sy);
			}
		}

		this.context.stroke();
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.context = this.dom.canvas.getContext("2d");
		this.renderLine();
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas")
		};
	}
	attachEvents() {
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
	set points(val) {
		this.#points = JSON.parse(val);
		this.renderLine();
	}
	set thickness(val) {
		this.#thickness = parseFloat(val);
	}
}

customElements.define("wc-canvas-line", WcCanvasLine);
