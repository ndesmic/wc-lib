function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

export class WcShaderCanvas extends HTMLElement {
	static observedAttributes = ["image", "height", "width"];
	#height = 240;
	#width = 320;
	#image;
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.createShadowDom = element.createShadowDom.bind(element);
		element.bootGpu = element.bootGpu.bind(element);
		element.compileShaders = element.compileShaders.bind(element);
		element.attachShaders = element.attachShaders.bind(element);
		element.render = element.render.bind(element);
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		await this.bootGpu();
		this.render();
	}
	createShadowDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `
				<style>
					:host { display: block; }
				</style>
				<canvas width="${this.#width}px" height="${this.#height}px"></canvas>
			`;
	}
	cacheDom() {
		this.dom = {};
		this.dom.canvas = this.shadow.querySelector("canvas");
	}
	attachEvents() {

	}
	async bootGpu() {
		this.context = this.dom.canvas.getContext("webgl");
		this.program = this.context.createProgram();
		this.compileShaders();
		this.attachShaders();
		this.context.linkProgram(this.program);
		this.context.useProgram(this.program);
		this.createPositions();
		this.createUvs();
		this.createIndicies();
		this.createTexture(await loadImage(this.getAttribute("image")));
	}
	createPositions() {
		const positions = new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			1.0, 1.0,
			-1.0, 1.0
		]);
		const positionBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);

		const positionLocation = this.context.getAttribLocation(this.program, "aVertexPosition");
		this.context.enableVertexAttribArray(positionLocation);
		this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, 0, 0);
	}
	createUvs() {
		const uvs = new Float32Array([
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		]);
		const uvBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, uvBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, uvs, this.context.STATIC_DRAW);

		const texCoordLocation = this.context.getAttribLocation(this.program, "aTextureCoordinate");
		this.context.enableVertexAttribArray(texCoordLocation);
		this.context.vertexAttribPointer(texCoordLocation, 2, this.context.FLOAT, false, 0, 0);
	}
	createIndicies() {
		const indicies = new Uint16Array([
			0, 1, 2,
			0, 2, 3
		]);
		const indexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, indicies, this.context.STATIC_DRAW);
	}
	createTexture(image) {
		const texture = this.context.createTexture();
		this.context.bindTexture(this.context.TEXTURE_2D, texture);

		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
		this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);

		this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, image);
	}
	compileShaders() {
		const vertexShaderText = `
				attribute vec3 aVertexPosition;
				attribute vec2 aTextureCoordinate;
				varying vec2 vTextureCoordinate;

				void main(){
					gl_Position = vec4(aVertexPosition, 1.0);
					vTextureCoordinate = aTextureCoordinate;
				}
			`;
		this.vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
		this.context.shaderSource(this.vertexShader, vertexShaderText);
		this.context.compileShader(this.vertexShader);

		if (!this.context.getShaderParameter(this.vertexShader, this.context.COMPILE_STATUS)) {
			console.error("Failed to compile vertex shader");
		}

		const fragmentShaderText = this.textContent;
		this.fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
		this.context.shaderSource(this.fragmentShader, fragmentShaderText);
		this.context.compileShader(this.fragmentShader);

		if (!this.context.getShaderParameter(this.fragmentShader, this.context.COMPILE_STATUS)) {
			console.error("Failed to compile fragment shader");
		}
	}
	attachShaders() {
		this.context.attachShader(this.program, this.vertexShader);
		this.context.attachShader(this.program, this.fragmentShader);
	}
	render() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue !== oldValue) {
			this[name] = newValue;
		}
	}
	set height(value) {
		this.#height = value;
		if (this.dom) {
			this.dom.canvas.height = value;
		}
	}
	set width(value) {
		this.#width = value;
		if (this.dom) {
			this.dom.canvas.height = value;
		}
	}
	set image(value) {
		this.#image = value;
		loadImage(value)
			.then(img => this.createTexture(img));
	}
	//TODO: throw away program on detach
}

customElements.define("wc-shader-canvas", WcShaderCanvas);
