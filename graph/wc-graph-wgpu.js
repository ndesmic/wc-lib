function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export class WcGraphWgpu extends HTMLElement {
	#points = [];
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
	#defaultColor = [1, 0, 0, 1];

	#dom;
	#context;
	#device;
	#vertexBufferDescriptor;
	#shaderModule;
	#renderPipeline;

	#guidePipeline;
	#guideVertexBuffer;

	static observedAttributes = ["points", "func", "step", "width", "height", "xmin", "xmax", "ymin", "ymax", "default-size", "default-color", "continuous", "thickness"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents.bind(element);
	}
	async connectedCallback() {
		this.cacheDom()
		if(navigator.gpu){
			await this.setupGpu();
			await this.loadShaderPipeline();
			await this.setupGuidePipeline();
			this.render();
			this.attachEvents();
		} else {
			this.innerText = "Browser does not support WebGPU";
		}
	}
	cacheDom(){
		this.attachShadow({ mode: "open" });
		this.#dom = {};
		this.#dom.canvas = document.createElement("canvas");

		this.shadowRoot.appendChild(this.#dom.canvas);
		this.#dom.canvas.height = this.#height;
		this.#dom.canvas.width = this.#width;
	}
	async setupGpu() {
		const adapter = await navigator.gpu.requestAdapter();
		this.#device = await adapter.requestDevice();
		this.#context = this.#dom.canvas.getContext("webgpu");

		this.#context.configure({
			device: this.#device,
			format: "bgra8unorm"
		});

		this.#vertexBufferDescriptor = [{
			attributes: [
				{
					shaderLocation: 0,
					offset: 0,
					format: "float32x2"
				},
				{
					shaderLocation: 1,
					offset: 8,
					format: "float32x4"
				}
			],
			arrayStride: 24,
			stepMode: "vertex"
		}];
	}
	async loadShaderPipeline() {
		this.#shaderModule = this.#device.createShaderModule({
			code: `
				struct VertexOut {
					[[builtin(position)]] position : vec4<f32>;
					[[location(0)]] color : vec4<f32>;
				};

				[[block]]
				struct Bounds {
					left: f32;
					right: f32;
					top: f32;
					bottom: f32;
				};

				[[group(0), binding(0)]] var<uniform> bounds: Bounds;

				fn inverse_lerp(a: f32, b: f32, v: f32) -> f32{
					return (v-a)/(b-a);
				}

				[[stage(vertex)]]
				fn vertex_main([[location(0)]] position: vec2<f32>, 
							   [[location(1)]] color: vec4<f32>) -> VertexOut
				{
					var output : VertexOut;
					output.position = vec4<f32>(
						mix(-1.0, 1.0, inverse_lerp(bounds.left, bounds.right,  position[0])),
						mix(-1.0, 1.0, inverse_lerp(bounds.top, bounds.bottom, position[1])),
						0.0, 
						1.0
					);
					output.color = color;
					return output;
				}

				[[stage(fragment)]]
				fn fragment_main(fragData: VertexOut) -> [[location(0)]] vec4<f32>
				{
					return fragData.color;
				}
			`
		});
		const pipelineDescriptor = {
			vertex: {
				module: this.#shaderModule,
				entryPoint: "vertex_main",
				buffers: this.#vertexBufferDescriptor
			},
			fragment: {
				module: this.#shaderModule,
				entryPoint: "fragment_main",
				targets: [
					{
						format: "bgra8unorm"
					}
				]
			}
		};

		if(this.#continuous){
			pipelineDescriptor.primitive = {
				topology: "line-strip",
				stripIndexFormat: "uint16"
			}
		} else {
			pipelineDescriptor.primitive = {
				topology: "point-list"
			}
		}

		this.#renderPipeline = this.#device.createRenderPipeline(pipelineDescriptor);
	}
	setupGuidePipeline(){
		const shaderModule = this.#device.createShaderModule({
			code: `
				struct VertexOut {
					[[builtin(position)]] position : vec4<f32>;
				};

				[[stage(vertex)]]
				fn vertex_main([[location(0)]] position: vec2<f32>) -> VertexOut
				{
					var output : VertexOut;
					output.position = vec4<f32>(
						position,
						0.0, 
						1.0
					);
					return output;
				}

				[[stage(fragment)]]
				fn fragment_main(fragData: VertexOut) -> [[location(0)]] vec4<f32>
				{
					return vec4<f32>(0.0, 0.0, 0.0, 1.0);
				}
			`
		});

		const vertexBufferDescriptor = [{
			attributes: [
				{
					shaderLocation: 0,
					offset: 0,
					format: "float32x2"
				}
			],
			arrayStride: 8,
			stepMode: "vertex"
		}];

		const pipelineDescriptor = {
			vertex: {
				module: shaderModule,
				entryPoint: "vertex_main",
				buffers: vertexBufferDescriptor
			},
			fragment: {
				module: shaderModule,
				entryPoint: "fragment_main",
				targets: [
					{
						format: "bgra8unorm"
					}
				]
			},
			primitive: {
				topology: "line-list"
			}
		};
		this.#guidePipeline = this.#device.createRenderPipeline(pipelineDescriptor);

		this.#guideVertexBuffer = this.#device.createBuffer({
			size: 32,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});
		new Float32Array(this.#guideVertexBuffer.getMappedRange()).set([0.0, -1, 0.0, 1, -1, 0.0, 1, 0.0]);
		this.#guideVertexBuffer.unmap();
	}
	render() {
		if(!this.#device) return;

		let points;
		if (this.#func) {
			points = [];
			for (let x = this.#xmin; x < this.#xmax; x += this.#step){
				const y = this.#func(x);
				points.push(x, y, ...this.#defaultColor);
			}
		} else {
			points = this.#points;
		}

		//vertex buffer
		const vertexBuffer = this.#device.createBuffer({
			size: points.length * 4,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(vertexBuffer.getMappedRange()).set(points);
		vertexBuffer.unmap();

		//bounds buffer
		const boundsBuffer = this.#device.createBuffer({
			size: 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(boundsBuffer.getMappedRange()).set([this.#xmin, this.#xmax, this.#ymin, this.#ymax]);
		boundsBuffer.unmap();


		const boundsGroup = this.#device.createBindGroup({
			layout: this.#renderPipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: {
						buffer: boundsBuffer,
						offset: 0,
						size: 16
					}
				}
			]
		});

		const commandEncoder = this.#device.createCommandEncoder();
		const clearColor = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
		const renderPassDescriptor = {
			colorAttachments: [
				{
					loadValue: clearColor,
					storeOp: "store",
					view: this.#context.getCurrentTexture().createView()
				}
			]
		};

		const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
		
		passEncoder.setPipeline(this.#guidePipeline);
		passEncoder.setVertexBuffer(0, this.#guideVertexBuffer);
		passEncoder.draw(4);

		passEncoder.setPipeline(this.#renderPipeline);
		passEncoder.setVertexBuffer(0, vertexBuffer);
		passEncoder.setBindGroup(0, boundsGroup);
		passEncoder.draw(points.length / 6);

		passEncoder.endPass();

		this.#device.queue.submit([commandEncoder.finish()]);
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
			p[2] ?? this.#defaultColor[0],
			p[3] ?? this.#defaultColor[1],
			p[4] ?? this.#defaultColor[2],
			p[5] ?? this.#defaultColor[3]
		]).flat();

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
		if (typeof (value) === "string") {
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

customElements.define("wc-graph-wgpu", WcGraphWgpu);
