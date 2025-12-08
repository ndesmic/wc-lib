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

function dotVector(a, b) {
	return a.reduce((sum, _, i) => sum + (a[i] * b[i]), 0);
}

class WcCanvasLine extends HTMLElement {
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
		if(!this.context) return;

		//Get the normal for each point as well as a tangent vector to the previous 
		const positions = [];
		const normals = [];
		const miters = [];
		for (let i = 0; i < this.#points.length; i++) {
			const current = this.#points[i];
			const prev = this.#points[i - 1];
			const next = this.#points[i + 1];

			positions.push(
				current[0], current[1],
				current[0], current[1]
			);

			if (next && !prev) { //start of line
				const delta = normalizeVector(subtractVector(next, current));

				normals.push(
					delta[1], -delta[0], 
					-delta[1], delta[0]
				);
				miters.push(
					delta[1], -delta[0], 
					-delta[1], delta[0]
				);
			} else if (prev && !next) { //end of line
				const delta = normalizeVector(subtractVector(current, prev));

				normals.push(
					delta[1], -delta[0], 
					-delta[1], delta[0]
				);
				miters.push(
					delta[1], -delta[0], 
					-delta[1], delta[0]
				);
			} else { //between lines
				const nextNormal = normalizeVector(subtractVector(next, current));
				const previousNormal = normalizeVector(subtractVector(prev, current)); 
				const bisection = normalizeVector(addVector(nextNormal, previousNormal));

				normals.push(
					-previousNormal[1], previousNormal[0], 
					previousNormal[1], -previousNormal[0], 
				);
				miters.push(
					bisection[0], bisection[1], 
					-bisection[0], -bisection[1]
				);
			}
		}

		this.context.lineWidth = 1;
		this.context.strokeStyle = "#000";
		this.context.fillStyle = "#000";

		let last = 0;

		for (let i = 0; i < positions.length; i += 2) {
			const position = [positions[i], positions[i + 1]];
			const normal = normalizeVector([normals[i], normals[i + 1]]);
			const normalMiter = normalizeVector([miters[i], miters[i + 1]]);

			const sx = ((position[0] + 1) / 2) * this.#width; //screen scaled X
			const sy = this.#height - (((position[1] + 1) / 2) * this.#height); //screen scaled Y

			const x = sx + (normalMiter[0] * (1 / dotVector(normal, normalMiter)) * this.#thickness);
			const y = sy - (normalMiter[1] * (1 / dotVector(normal, normalMiter)) * this.#thickness);

			if(i === 0){
				this.context.beginPath();
				this.context.moveTo(x, y);
			} else if(i < 4){
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
		}

		this.context.strokeStyle = "#F00000";
		for(let i = 0; i < this.#points.length; i++){
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
	set points(val){
		this.#points = JSON.parse(val);
		this.renderLine();
	}
	set thickness(val){
		this.#thickness = parseFloat(val);
	}
}

customElements.define("wc-canvas-line", WcCanvasLine);
