function compileShader(context, text, type) {
	const shader = context.createShader(type);
	context.shaderSource(shader, text);
	context.compileShader(shader);

	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile shader: ${context.getShaderInfoLog(shader)}`);
	}
	return shader;
}

function compileProgram(context, vertexShader, fragmentShader) {
	const program = context.createProgram();
	context.attachShader(program, vertexShader);
	context.attachShader(program, fragmentShader);
	context.linkProgram(program);

	if (!context.getProgramParameter(program, context.LINK_STATUS)) {
		throw new Error(`Failed to compile WebGL program: ${context.getProgramInfoLog(program)}`);
	}

	return program;
}

function autoBindUniform(context, uniformName, value) {
	const location = context.getUniformLocation(context.getParameter(context.CURRENT_PROGRAM), uniformName);
	if (!location) return;
	if (Array.isArray(value)) {
		switch (value.length) {
			case 1: {
				context.uniform1fv(location, value);
				break;
			}
			case 2: {
				context.uniform2fv(location, value);
				break;
			}
			case 3: {
				context.uniform3fv(location, value);
				break;
			}
			case 4: {
				context.uniform4fv(location, value);
				break;
			}
			default: {
				console.error(`Invalid dimension for binding uniforms. ${uniformName} with value of length ${value.length}`);
			}
		}
	} else {
		context.uniform1f(location, value);
	}
	return location;
}

function bindAttribute(context, attributes, attributeName, size) {
	const attributeLocation = context.getAttribLocation(context.getParameter(context.CURRENT_PROGRAM), attributeName);
	if (attributeLocation === -1) {
		console.error(attributeName, "Failed to bind")
		return; //bail if it doesn't exist in the shader
	}
	const attributeBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, attributeBuffer);

	context.bufferData(context.ARRAY_BUFFER, attributes, context.STATIC_DRAW);

	context.enableVertexAttribArray(attributeLocation);
	context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
	return attributeLocation;
}

//linear algebra

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

export class WcGlLine extends HTMLElement {
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

		const points = this.#points.flatMap(p => [p[0],p[1],p[0],p[1]]);

		//Get the normal for each point as well as a tangent vector to the previous point
		const normals = [];
		const miters = [];
		for (let i = 0; i < this.#points.length; i++) {
			const current = this.#points[i];
			const prev = this.#points[i - 1];
			const next = this.#points[i + 1];

			if (next && !prev) { //start of line
				const delta = normalizeVector(subtractVector(next, current));
				normals.push(delta[1], -delta[0], -delta[1], delta[0]);
				miters.push(delta[1], -delta[0], -delta[1], delta[0]);
			} else if (prev && !next) { //end of line
				const delta = normalizeVector(subtractVector(current, prev));
				normals.push(delta[1], -delta[0], -delta[1], delta[0]);
				miters.push(delta[1], -delta[0], -delta[1], delta[0]);
			} else { //between lines
				const nextVector = normalizeVector(subtractVector(next, current));
				const previousVector = normalizeVector(subtractVector(prev, current));
				const bisection = normalizeVector(addVector(nextVector, previousVector));
				normals.push(
					-previousVector[1], previousVector[0],
					previousVector[1], -previousVector[0]);
				miters.push(bisection[0], bisection[1], -bisection[0], -bisection[1]);
			}
		}

		//Setup WebGL shaders
		const vertexShader = compileShader(this.context, `
			attribute vec2 aVertexPosition;
			attribute vec2 aVertexNormal;
			attribute vec2 aVertexMiter;
			attribute vec4 aVertexColor;
			uniform float uThickness;
			uniform vec2 uScale;

			varying mediump vec4 vColor;

			void main(){
				float length = uThickness / dot(aVertexMiter, aVertexNormal) / 2.0;
				
				gl_Position = vec4(aVertexPosition + (aVertexMiter * length * uScale), 0.0, 1.0);
				vColor = aVertexColor;
			}
		`, this.context.VERTEX_SHADER);

		const fragmentShader = compileShader(this.context, `
			varying lowp vec4 vColor;
			void main() {

				gl_FragColor = vColor;
			}
		`, this.context.FRAGMENT_SHADER);

		const program = compileProgram(this.context, vertexShader, fragmentShader)

		this.context.useProgram(program);

		//setup colors
		const colorBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
		const enums = [
			[1.0, 0.0, 0.0, 1.0],
			[0.0, 1.0, 0.0, 1.0],
			[0.0, 0.0, 1.0, 1.0],
			[1.0, 0.0, 1.0, 1.0]
		];
		let colors = [];
		for (let i = 0; i < points.length; i++) {
			colors.push(...enums[i % 4]);
		}

		//attributes
		const pointsLocation = bindAttribute(this.context, new Float32Array(points), "aVertexPosition", 2);
		bindAttribute(this.context, new Float32Array(normals), "aVertexNormal", 2);
		bindAttribute(this.context, new Float32Array(miters), "aVertexMiter", 2);
		bindAttribute(this.context, new Float32Array(colors), "aVertexColor", 4);


		autoBindUniform(this.context, "uThickness", this.#thickness);
		autoBindUniform(this.context, "uScale", [2 / this.#height, 2 / this.#width]);

		this.context.disable(this.context.CULL_FACE);

		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.context.drawArrays(this.context.TRIANGLE_STRIP, 0, points.length);

		//

		//grid
		/*
		this.context.disableVertexAttribArray(pointsLocation);

		const gridVertexShader = compileShader(this.context, `
			precision mediump float;
			attribute vec2 aPoints;

			void main(){
				gl_Position = vec4(aPoints, 1.0, 1.0);
			}
		`, this.context.VERTEX_SHADER);

		const gridFragmentShader = compileShader(this.context, `
			precision mediump float;

			void main() {
				vec2 coords = floor(gl_FragCoord.xy);
				if((floor(mod(coords.x, 10.0)) == 0.0 || floor(mod(coords.y, 10.0)) == 0.0) && coords.x != 0.0 && coords.y != 0.0){
					gl_FragColor = vec4(0.0,0.0,0.0,1.0);
				} else {
					discard;
				}
			}
		`, this.context.FRAGMENT_SHADER);

		const gridProgram = compileProgram(this.context, gridVertexShader, gridFragmentShader);
		const quadArray = new Float32Array([1, -1, 1, 1, -1, -1, -1, 1]);
		this.context.useProgram(gridProgram);
		bindAttribute(this.context, quadArray, "aPoints", 2)
		
		this.context.drawArrays(this.context.TRIANGLE_STRIP, 0, 4);
		*/
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		this.context = this.dom.canvas.getContext("webgl2");
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
		this.renderLine();
	}
	set thickness(val){
		this.#thickness = parseFloat(val);
	}
}

customElements.define("wc-gl-line", WcGlLine);
