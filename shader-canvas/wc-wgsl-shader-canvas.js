function loadImage(url) {
	return new Promise((res, rej) => {
		const image = new Image();
		image.src = url;
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

export class WcWgslShaderCanvas extends HTMLElement {
	#image;
	#height = 240;
	#width = 320;
	#globals;
	#setReady;
	#ready;
	#src;
	#device;
	#context;
	#vertexBufferDescriptor;
	#vertexBuffer;
	#sampler;
	#texture;
	#shaderModule;
	#renderPipeline;

	static observedAttributes = ["image", "height", "width", "src", "globals", "src"];
	constructor() {
		super();
		this.bind(this);
		this.#ready = new Promise((res) => {
			this.#setReady = res;
		});
	}
	bind(element) {
		this.draw = this.draw.bind(element);
		this.updateTexture = this.updateTexture.bind(element);
	}
	createShadowDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
			 :host {
				 display: block;
			 }
			</style>
            <canvas width="${this.#width}px" height="${this.#height}px"></canvas>
			<div id="message"></div>
        `;
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
		if (!navigator.gpu) {
			this.dom.message.textContent = `⚠ WebGPU Support is not available`;
		} else {
			await this.bootGpu();
			this.#setReady();
			await this.updateShader();
			await this.updateTexture();
			await this.draw();
		}
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("canvas"),
			message: this.shadowRoot.querySelector("#message"),
			script: this.querySelector("script")
		};
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue
		}
	}
	async bootGpu() {
		const adapter = await navigator.gpu.requestAdapter();
		this.#device = await adapter.requestDevice();
		this.#context = this.dom.canvas.getContext("webgpu");

		this.#context.configure({
			device: this.#device,
			format: "bgra8unorm"
		});

		//2d position + uv
		const vertices = new Float32Array([
			-1.0, -1.0, 0.0, 1.0,
			1.0, -1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 0.0,

			-1.0, -1.0, 0.0, 1.0,
			1.0, 1.0, 1.0, 0.0,
			-1.0, 1.0, 0.0, 0.0
		]);

		this.#vertexBuffer = this.#device.createBuffer({
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true
		});

		new Float32Array(this.#vertexBuffer.getMappedRange()).set(vertices);
		this.#vertexBuffer.unmap();

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
					format: "float32x2"
				}
			],
			arrayStride: 16,
			stepMode: "vertex"
		}];
	}
	async updateTexture() {
		if (!this.#image) return;
		await this.#ready;
		const textureSize = {
			width: this.#image.width,
			height: this.#image.height,
			depth: 1
		};
		this.#texture = this.#device.createTexture({
			size: textureSize,
			dimension: '2d',
			format: `rgba8unorm`,
			usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.SAMPLED
		});

		this.#device.queue.copyExternalImageToTexture({
			source: this.#image
		}, {
			texture: this.#texture,
			mipLevel: 0
		},
			textureSize);

		this.#sampler = this.#device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "linear",
			minFilter: "nearest"
		});
	}
	async updateShader() {
		if(!this.#src && !this.dom.script) return;
		await this.#ready;

		this.#shaderModule = this.#device.createShaderModule({
			code: this.#src ? this.#src : this.dom.script?.textContent
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
			},
			primitive: {
				topology: "triangle-list"
			}
		};

		this.#renderPipeline = this.#device.createRenderPipeline(pipelineDescriptor);
	}
	async draw() {
		if (!this.#texture || !this.#renderPipeline) return;
		await this.#ready;

		const commandEncoder = this.#device.createCommandEncoder();

		const clearColor = { r: 0, g: 0, b: 0, a: 1 };
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
		passEncoder.setPipeline(this.#renderPipeline);
		passEncoder.setVertexBuffer(0, this.#vertexBuffer);

		const textureBindGroup = this.#device.createBindGroup({
			layout: this.#renderPipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: this.#sampler },
				{ binding: 1, resource: this.#texture.createView() }
			]
		});
		passEncoder.setBindGroup(0, textureBindGroup);

		if (this.#globals) {
			const data = new Float32Array(this.#globals.flat());
			const uniformBuffer = this.#device.createBuffer({
				size: data.byteLength,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
			});
			this.#device.queue.writeBuffer(uniformBuffer, 0, data);
			const uniformGroup = this.#device.createBindGroup({
				layout: this.#renderPipeline.getBindGroupLayout(1),
				entries: [
					{
						binding: 0,
						resource: {
							buffer: uniformBuffer,
							offset: 0,
							size: data.byteLength
						}
					}
				]
			});
			passEncoder.setBindGroup(1, uniformGroup);
		}

		passEncoder.draw(6); //TODO need index buffer
		passEncoder.endPass();
		this.#device.queue.submit([commandEncoder.finish()]);
	}
	set image(val) {
		loadImage(val)
			.then(img => createImageBitmap(img))
			.then(bitmap => {
				this.#image = bitmap;
				this.updateTexture()
					.then(() => this.draw());
			});
	}
	set src(val) {
		fetch(val)
			.then(r => r.text())
			.then(txt => {
				this.#src = txt;
				this.updateShader()
					.then(() => this.draw());
			});
	}
	set height(val) {
		val = parseInt(val);
		this.#height = val;
		if (this.dom) {
			this.dom.canvas.height = val;
		}
	}
	set width(val) {
		val = parseInt(val);
		this.#width = val;
		if (this.dom) {
			this.dom.canvas.width = val;
		}
	}
	set globals(val) {
		val = typeof (val) === "object" ? val : JSON.parse(val);
		this.#globals = val;
		this.draw();
	}
}

customElements.define("wc-wgsl-shader-canvas", WcWgslShaderCanvas);