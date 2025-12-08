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

class WcGraphGl extends HTMLElement {
	#points = [];
	#colors = [];
	#width = 320;
	#height = 240;
	#xmax = 100;
	#xmin = -100;
	#ymax = 100;
	#ymin = -100;
	#func;
	#step = 1;
	#thickness = 1;
	#continuous = false;

	#defaultSize = 4;
	#defaultColor = [1,0,0,1];

	static observedAttributes = ["points", "func", "step", "width", "height", "xmin", "xmax", "ymin", "ymax", "default-size", "default-color", "continuous", "thickness"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents.bind(element);
	}
	connectedCallback(){
		this.attachShadow({ mode: "open" });
		this.canvas = document.createElement("canvas");
		this.shadowRoot.appendChild(this.canvas);
		this.canvas.height = this.#height;
		this.canvas.width = this.#width;
		this.context = this.canvas.getContext("webgl2");

		this.render();
		this.attachEvents();
	}
	render() {
		if(!this.context) return;
		let points;
		let colors;
		if(this.#func){
			points = [];
			colors = [];
			for (let x = this.#xmin; x < this.#xmax; x += this.#step) {
				const y = this.#func(x);
				points.push([x, y, this.#defaultSize]);
				colors.push(this.#defaultColor);
			}
		} else {
			points = this.#points;
			colors = this.#colors;
		}

		//Setup WebGL shaders
		const vertexShader = compileShader(this.context, `
			attribute vec3 aVertexPosition;
			attribute vec4 aVertexColor;
			uniform vec4 uBounds;

			varying mediump vec4 vColor;

			float inverseLerp(float a, float b, float v){
				return (v-a)/(b-a);
			}

			void main(){
				gl_PointSize = aVertexPosition.z;
				gl_Position = vec4(mix(-1.0,1.0,inverseLerp(uBounds.x, uBounds.y, aVertexPosition.x)), mix(-1.0,1.0,inverseLerp(uBounds.z, uBounds.w, aVertexPosition.y)), 1.0, 1.0);
				vColor = aVertexColor;
			}
		`, this.context.VERTEX_SHADER);

		const fragmentShader = compileShader(this.context, `
			varying mediump vec4 vColor;
			void main() {
				gl_FragColor = vColor;
			}
		`, this.context.FRAGMENT_SHADER);

		const program = compileProgram(this.context, vertexShader, fragmentShader)

		this.context.useProgram(program);

		//draw guides
		{
			const positionBuffer = this.context.createBuffer();
			this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);

			const positions = new Float32Array([
				(this.#xmax + this.#xmin) / 2, this.#ymin, 10,
				(this.#xmax + this.#xmin) / 2, this.#ymax, 10,
				this.#xmin, (this.#ymax + this.#ymin) / 2, 10,
				this.#xmax, (this.#ymax + this.#ymin) / 2, 10
			]);
			this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

			const positionLocation = this.context.getAttribLocation(program, "aVertexPosition");
			this.context.enableVertexAttribArray(positionLocation);
			this.context.vertexAttribPointer(positionLocation, 3, this.context.FLOAT, false, 0, 0);

			const colorBuffer = this.context.createBuffer();
			this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);

			const colorsArray = new Float32Array([
				0,0,0,1,
				0,0,0,1,
				0,0,0,1,
				0,0,0,1
			]);
			this.context.bufferData(this.context.ARRAY_BUFFER, colorsArray, this.context.STATIC_DRAW);

			const colorLocation = this.context.getAttribLocation(program, "aVertexColor");
			this.context.enableVertexAttribArray(colorLocation);
			this.context.vertexAttribPointer(colorLocation, 4, this.context.FLOAT, false, 0, 0);

			const bounds = new Float32Array([this.#xmin, this.#xmax, this.#ymin, this.#ymax]);
			const boundsLocation = this.context.getUniformLocation(program, "uBounds");
			this.context.uniform4fv(boundsLocation, bounds);

			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			this.context.drawArrays(this.context.LINES, 0, points.length);
		}
		
		//setup vertices
		const positionBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);

		const positions = new Float32Array(points.flat());
		this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

		const positionLocation = this.context.getAttribLocation(program, "aVertexPosition");
		this.context.enableVertexAttribArray(positionLocation);
		this.context.vertexAttribPointer(positionLocation, 3, this.context.FLOAT, false, 0, 0);

		//setup color
		const colorBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);

		const colorsArray = new Float32Array(colors.flat());
		this.context.bufferData(this.context.ARRAY_BUFFER, colorsArray, this.context.STATIC_DRAW);

		const colorLocation = this.context.getAttribLocation(program, "aVertexColor");
		this.context.enableVertexAttribArray(colorLocation);
		this.context.vertexAttribPointer(colorLocation, 4, this.context.FLOAT, false, 0, 0);

		//setup bounds
		const bounds = new Float32Array([this.#xmin, this.#xmax, this.#ymin, this.#ymax]);
		const boundsLocation = this.context.getUniformLocation(program, "uBounds");
		this.context.uniform4fv(boundsLocation, bounds);

		//draw
		if(this.#continuous){
			this.context.lineWidth(this.#thickness);
			console.log(this.context.getParameter(this.context.ALIASED_LINE_WIDTH_RANGE));
			this.context.drawArrays(this.context.LINE_STRIP, 0, points.length);
		}

		this.context.drawArrays(this.context.POINTS, 0, points.length);
	}
	attachEvents() {

	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[hyphenCaseToCamelCase(name)] = newValue;
	}
	set points(value) {
		if (typeof (value) === "string") {
			value = JSON.parse(value);
		}

		this.#points = value.map(p => [
			p[0],
			p[1],
			p[6] ?? this.#defaultSize
		]);

		this.#colors = value.map(p => p.length > 2 ? [
			p[2],
			p[3],
			p[4],
			p[5]
		] : this.#defaultColor);

		this.render();
	}
	get points() {
		return this.#points;
	}
	set width(value) {
		this.#width = parseFloat(value);
	}
	get width() {
		return this.#width;
	}
	set height(value) {
		this.#height = parseFloat(value);
	}
	get height() {
		return this.#height;
	}
	set xmax(value) {
		this.#xmax = parseFloat(value);
	}
	get xmax() {
		return this.#xmax;
	}
	set xmin(value) {
		this.#xmin = parseFloat(value);
	}
	get xmin() {
		return this.#xmin;
	}
	set ymax(value) {
		this.#ymax = parseFloat(value);
	}
	get ymax() {
		return this.#ymax;
	}
	set ymin(value) {
		this.#ymin = parseFloat(value);
	}
	get ymin() {
		return this.#ymin;
	}
	set func(value) {
		this.#func = new Function(["x"], value);
		this.render();
	}
	set step(value) {
		this.#step = parseFloat(value);
	}
	set defaultSize(value) {
		this.#defaultSize = parseFloat(value);
	}
	set defaultColor(value) {
		if(typeof(value) === "string"){
			this.#defaultColor = JSON.parse(value);
		} else {
			this.#defaultColor = value;
		}
	}
	set continuous(value) {
		this.#continuous = value !== undefined;
	}
	set thickness(value) {
		this.#thickness = parseFloat(value);
	}
}

customElements.define("wc-graph-gl", WcGraphGl);
