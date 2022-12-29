function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = e => {
			console.log(e);
			rej(e);
		};
	});
}

function bindAttribute(context, attributes, attributeName, size, program) {
	program = program ?? context.getParameter(context.CURRENT_PROGRAM);
	attributes = attributes instanceof Float32Array ? attributes : new Float32Array(attributes);

	const attributeLocation = context.getAttribLocation(program, attributeName);
	if (attributeLocation === -1) return; //bail if it doesn't exist in the shader
	const attributeBuffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, attributeBuffer);

	context.bufferData(context.ARRAY_BUFFER, attributes, context.STATIC_DRAW);

	context.enableVertexAttribArray(attributeLocation);
	context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
}

function compileShader(context, text, type) {
	const shader = context.createShader(type);
	context.shaderSource(shader, text);
	context.compileShader(shader);

	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile ${type === context.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${context.getShaderInfoLog(shader)}`);
	}
	return shader;
}

function createDataTexture(context, data, textureIndex = 1, width = 32, height = 32){
	context.activeTexture(context.TEXTURE0 + textureIndex);
	const texture = context.createTexture();
	context.bindTexture(context.TEXTURE_2D, texture);

	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);

	context.texImage2D(context.TEXTURE_2D, 0, context.R32F, width, height, 0, context.RED, context.FLOAT, data);
}

function createTexture(context, image, textureIndex = 0) {
	context.activeTexture(context.TEXTURE0 + textureIndex);
	const texture = context.createTexture();
	context.bindTexture(context.TEXTURE_2D, texture);

	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
	context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);

	context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
}

const indentityKernel = new Int32Array([
	0, 0, 0,
	0, 1, 0,
	0, 0, 0
]);

export class WcGlSlConvolutionCanvas extends HTMLElement {
	static observedAttributes = ["image", "height", "width", "kernel"];
	#image;
	#setReady;
	#program;
	#kernel = indentityKernel;
	#kernelWidth = 3;
	#kernelHeight = 3;
	ready = new Promise(res => { this.#setReady = res; });
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
		element.render = element.render.bind(element);
	}
	connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		this.attachEvents();
		this.bootGpu();
		this.#setReady();
		this.render();
	}
	createShadowDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; }
					#message { display: none; }
					canvas { image-rendering: pixelated; width: 180px; height: 180px; }
				</style>
				<canvas width="180" height="180"></canvas>
			`;
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			message: this.shadowRoot.querySelector("#message")
		};
	}
	attachEvents() {

	}
	bootGpu() {
		this.context = this.dom.canvas.getContext("webgl2");
		this.compileShaders();
		this.createAttributes();
		this.createIndicies();
		this.createUniforms();
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
	createAttributes(){
		bindAttribute(this.context, [
			-1.0, -1.0,
			1.0, -1.0,
			1.0, 1.0,
			-1.0, 1.0
		], "aPosition", 2);
		bindAttribute(this.context, [
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		], "aUv", 2);
	}
	compileShaders() {
		this.#program = this.context.createProgram();
		const vertexShader = compileShader(this.context, `#version 300 es
				precision highp float;
				in vec3 aPosition;
				in vec2 aUv;
				
				out vec2 uv;
				flat out vec2 imgPixelSize;
				flat out vec2 kernelPixelSize;
				flat out ivec2 kernelSize;

				uniform sampler2D sampler;
				uniform sampler2D kernel;

				void main(){			
					ivec2 imgSize = textureSize(sampler, 0);
					imgPixelSize = vec2(1.0, 1.0) / vec2(imgSize);

					kernelSize = textureSize(kernel, 0);
					kernelPixelSize = vec2(1.0, 1.0) / vec2(kernelSize);

					gl_Position = vec4(aPosition, 1.0);
					uv = aUv;
				}
			`, this.context.VERTEX_SHADER);
	
		const fragmentShader = compileShader(this.context, `#version 300 es
				precision highp float;
				
				in vec2 uv;
				flat in vec2 imgPixelSize;
				flat in ivec2 kernelSize;
				flat in vec2 kernelPixelSize;
				
				uniform sampler2D sampler;
				uniform sampler2D kernel;

				out vec4 glColor;

				void main(){
					vec2 kernelMid = vec2((kernelSize - ivec2(1, 1)) / 2);

					vec3 sum = vec3(0.0, 0.0, 0.0);

					for(int x = 0; x < kernelSize[0]; x++){
						for(int y = 0; y < kernelSize[1]; y++){
							vec2 sampleUV = uv + (-kernelMid + vec2(x, y)) * imgPixelSize;
							float kernelValue = texture(kernel,  (vec2(x, y) + vec2(0.5, 0.5)) * kernelPixelSize).r;

							sum += (texture(sampler, sampleUV).rgb * kernelValue);
						}
					}
					
					glColor = vec4(sum, 1.0);
				}
		`, this.context.FRAGMENT_SHADER);

		this.context.attachShader(this.#program, vertexShader);
		this.context.attachShader(this.#program, fragmentShader);

		this.context.linkProgram(this.#program);
		this.context.useProgram(this.#program);
	}
	createUniforms() {
		if(!this.#image) return;
		createTexture(this.context, this.#image, 0);
		const imgLocation = this.context.getUniformLocation(this.#program, "sampler");
		this.context.uniform1i(imgLocation, 0);

		if (!this.#kernel) return;
		createDataTexture(this.context, this.#kernel, 1, this.#kernelWidth, this.#kernelWidth);
		const dataLocation = this.context.getUniformLocation(this.#program, "kernel");
		this.context.uniform1i(dataLocation, 1);
	}
	render() {
		this.context.viewport(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
		this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (newValue !== oldValue) {
			this[name] = newValue;
		}
	}
	set image(value) {
		this.ready //can't be bothered to make this parallel
			.then(() => loadImage(value))
			.then(img => {
				this.dom.canvas.width = img.naturalWidth;
				this.dom.canvas.height = img.naturalHeight;
				this.#image = img;
			})
			.then(() => {
				this.createUniforms();
				this.render();
			});
	}
	set kernel(val) {
		const valMatrix = typeof(val) === "string"
			? JSON.parse(val)
			: val;

		const width = valMatrix[0].length;
		const height = valMatrix.length;
		this.#kernel = new Float32Array(valMatrix.flat());
		this.#kernelWidth = width;
		this.#kernelHeight = height;
		
		this.ready.then(() => {
			this.createUniforms();
			this.render();
		});
	}
	//TODO: throw away program on detach
}

customElements.define("wc-glsl-convolution-canvas", WcGlSlConvolutionCanvas);
