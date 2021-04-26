function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

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

export class WcLine extends HTMLElement {
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

		const normals = this.#points.flatMap((p,i) => {
			const prev = this.#points[i - 1];
			const next = this.#points[i + 1];

			if (next && !prev) { //start of line
				const dx = next[0] - p[0];
				const dy = next[1] - p[1];
				return [dy, -dx, dx, dy, -dy, dx, dx, dy];
			} else if (prev && !next) { //end of line
				const dx = p[0] - prev[0];
				const dy = p[1] - prev[1];
				return [dy, -dx, dx, dy, -dy, dx, dx, dy];
			} else { //between lines
				const ndx = next[0] - p[0];
				const ndy = next[1] - p[1];
				const pdx = prev[0] - p[0];
				const pdy = prev[1] - p[1];
				const nx = ndx + pdx;
				const ny = ndy + pdy;
				return [nx, ny, pdx, pdy, -nx, -ny, pdx, pdy];
			}
		});

		//Setup WebGL shaders
		const vertexShader = compileShader(this.context, `
			attribute vec2 aVertexPosition;
			attribute vec4 aVertexNormal;
			attribute vec4 aVertexColor;
			uniform float uThickness;

			varying mediump vec4 vColor;

			void main(){
				vColor = aVertexColor;
				float angle = acos(dot(normalize(aVertexNormal.xy), normalize(aVertexNormal.zw)));
				float length = uThickness / (2.0 * sin(angle));

				gl_Position = vec4(aVertexPosition + (normalize(aVertexNormal.xy) * length), 1.0, 1.0);
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

		//setup vertices
		const positionBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);

		const positions = new Float32Array(points);
		this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

		const positionLocation = this.context.getAttribLocation(program, "aVertexPosition");
		this.context.enableVertexAttribArray(positionLocation);
		this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, 0, 0);

		//setup normals
		const normalBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, normalBuffer);

		const normalsArray = new Float32Array(normals);
		this.context.bufferData(this.context.ARRAY_BUFFER, normalsArray, this.context.STATIC_DRAW);

		const normalLocation = this.context.getAttribLocation(program, "aVertexNormal");
		this.context.enableVertexAttribArray(normalLocation);
		this.context.vertexAttribPointer(normalLocation, 4, this.context.FLOAT, false, 0, 0);

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
		const colorsArray = new Float32Array(colors);
		this.context.bufferData(this.context.ARRAY_BUFFER, colorsArray, this.context.STATIC_DRAW);

		const colorLocation = this.context.getAttribLocation(program, "aVertexColor");
		this.context.enableVertexAttribArray(colorLocation);
		this.context.vertexAttribPointer(colorLocation, 4, this.context.FLOAT, false, 0, 0);

		//setup uniforms
		const thickness = this.#thickness * (2 / this.#height);
		const thicknessLocation = this.context.getUniformLocation(program, "uThickness");
		this.context.uniform1f(thicknessLocation, thickness);

		this.context.disable(this.context.CULL_FACE);

		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.context.drawArrays(this.context.TRIANGLE_STRIP, 0, points.length);
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

customElements.define("wc-line", WcLine);
