import { parseFloatArrayOrDefault, parseFloatArrayWithLengthOrDefault, parseIntOrDefault } from "../../libs/wc-utils.js";
import { pack } from "../../libs/buffer-utils.js";
import { loadImage } from "../../libs/image-utils.js";

export class WcWgslConvolutionCanvas extends HTMLElement {
  #image;
  #height = 240;
  #width = 320;
  #setReady;
  #ready;
  #kernel;
  #kernelShape;
  #device;
  #context;
  #vertexBufferDescriptor;
  #vertexBuffer;
  #sampler;
  #texture;
  #renderPipeline;

  static observedAttributes = ["image", "height", "width", "kernel", "shape"];
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
    this.onError = this.onError.bind(element);
  }
  createShadowDom() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
			<style>
			 :host {
				 display: block;
				 #message {
				 	white-space: pre;
				 }
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
      this.attachEvents();
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
      script: this.querySelector("script"),
    };
  }
  attachEvents() {
    this.#device.addEventListener("uncapturederror", this.onError);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
    }
  }
  async bootGpu() {
    const adapter = await navigator.gpu.requestAdapter();
    this.#device = await adapter.requestDevice();
    this.#context = this.dom.canvas.getContext("webgpu");

    this.#context.configure({
      device: this.#device,
      format: "bgra8unorm",
    });

    //2d position + uv
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      0.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      0.0,

      -1.0,
      -1.0,
      0.0,
      1.0,
      1.0,
      1.0,
      1.0,
      0.0,
      -1.0,
      1.0,
      0.0,
      0.0,
    ]);

    this.#vertexBuffer = this.#device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Float32Array(this.#vertexBuffer.getMappedRange()).set(vertices);
    this.#vertexBuffer.unmap();

    this.#vertexBufferDescriptor = [{
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
        {
          shaderLocation: 1,
          offset: 8,
          format: "float32x2",
        },
      ],
      arrayStride: 16,
      stepMode: "vertex",
    }];
  }
  async updateTexture() {
    if (!this.#image) return;
    await this.#ready;
    const textureSize = {
      width: this.#image.width,
      height: this.#image.height,
      depthOrArrayLayers: 1,
    };
    this.#texture = this.#device.createTexture({
      size: textureSize,
      dimension: "2d",
      format: `rgba8unorm`,
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });

    this.#device.queue.copyExternalImageToTexture({
      source: this.#image,
    }, {
      texture: this.#texture,
      mipLevel: 0,
    }, textureSize);

    this.#sampler = this.#device.createSampler({
      addressModeU: "repeat",
      addressModeV: "repeat",
      magFilter: "linear",
      minFilter: "nearest",
    });
  }
  async updateShader() {
    await this.#ready;
    this.dom.message.textContent = "";

    const res = await fetch("./convolution.wgsl");
    const txt = await res.text();

    const shaderModule = this.#device.createShaderModule({
      code: txt,
    });

    const compilationInfo = await shaderModule.getCompilationInfo();
    if (compilationInfo.messages.length > 0) {
      let messageString = "";
      for (const message of compilationInfo.messages) {
        const type = message.type === "error"
          ? "❌"
          : msg.type === "warning"
          ? "⚠️"
          : "ℹ️";
        messageString +=
          `${type} ${message.message} (${message.lineNum}:${message.linePos})`;
      }
      this.dom.message.textContent = messageString;
      return;
    }

    const textureBindGroupLayout = this.#device.createBindGroupLayout({
      label: "canvas-texture-bindgroup-layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {
            type: "filtering",
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: "float",
            viewDimension: "2d",
          },
        },
      ],
    });

    const kernelBindGroupLayout = this.#device.createBindGroupLayout({
      label: "canvas-texture-bindgroup-layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {
            type: "uniform",
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {
            type: "read-only-storage",
          },
        },
      ],
    });

    const pipelineLayout = this.#device.createPipelineLayout({
      label: "canvas-pipeline-layout",
      bindGroupLayouts: [textureBindGroupLayout, kernelBindGroupLayout],
    });

    const pipelineDescriptor = {
      label: "canvas-pipeline",
      vertex: {
        module: shaderModule,
        entryPoint: "vertex_main",
        buffers: this.#vertexBufferDescriptor,
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragment_main",
        targets: [
          {
            format: "bgra8unorm",
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
      layout: pipelineLayout,
    };

    this.#renderPipeline = this.#device.createRenderPipeline(
      pipelineDescriptor,
    );
  }
  async draw() {
    if (!this.#texture || !this.#renderPipeline || !this.#kernel || !this.#kernelShape) return;
    await this.#ready;

    const commandEncoder = this.#device.createCommandEncoder({
      label: "canvas-command-encoder",
    });

    const clearColor = { r: 0, g: 0, b: 0, a: 1 };
    const renderPassDescriptor = {
      label: "canvas-render-pass",
      colorAttachments: [
        {
          loadValue: clearColor,
          storeOp: "store",
          loadOp: "load",
          view: this.#context.getCurrentTexture().createView(),
        },
      ],
    };
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.#renderPipeline);
    passEncoder.setVertexBuffer(0, this.#vertexBuffer);

    //Texture
    const textureBindGroup = this.#device.createBindGroup({
      label: "canvas-texture-bind-group",
      layout: this.#renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.#sampler },
        { binding: 1, resource: this.#texture.createView() },
      ],
    });
    passEncoder.setBindGroup(0, textureBindGroup);

    //Kernel
    const kernel = {
      shape: this.#kernelShape,
      values: this.#kernel,
    };

    const kernelData = pack(kernel, [
      ["shape", "vec2u32"],
      ["values", ["f32"]],
    ]);

    const kernelBuffer = this.#device.createBuffer({
      size: kernelData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      label: "canvas-kernel-buffer",
    });

    this.#device.queue.writeBuffer(kernelBuffer, 0, kernelData);

    //Size
    const size = {
      height: this.#image.height,
      width: this.#image.width,
    };

    const sizeData = pack(size, [
      ["height", "u32"],
      ["width", "u32"],
    ]);

    const sizeBuffer = this.#device.createBuffer({
      size: sizeData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: "canvas-size-buffer",
    });

    this.#device.queue.writeBuffer(sizeBuffer, 0, sizeData);

    const kernelBindGroup = this.#device.createBindGroup({
      label: "canvas-kernel-bind-group",
      layout: this.#renderPipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: sizeBuffer },
        { binding: 1, resource: kernelBuffer },
      ],
    });
    passEncoder.setBindGroup(1, kernelBindGroup);

    passEncoder.draw(6); //TODO need index buffer
    passEncoder.end();
    this.#device.queue.submit([commandEncoder.finish()]);
  }
  onError(e) {
    this.dom.message.textContent = e.error.message;
  }
  set image(val) {
    loadImage(val)
      .then(async (img) => {
        this.#image = await createImageBitmap(img);
        await this.updateTexture();
        this.height = img.naturalHeight;
        this.width = img.naturalWidth;
        this.draw();
      });
  }
  set kernel(val) {
    this.#kernel = parseFloatArrayOrDefault(val);
  }

  set shape(val){
    this.#kernelShape = parseFloatArrayWithLengthOrDefault(val, 2, []);
  }

  set height(val) {
    this.#height = parseIntOrDefault(val, 240);
    if (this.dom) {
      this.dom.canvas.height = val;
    }
  }
  set width(val) {
    this.#width = parseIntOrDefault(val, 320);
    if (this.dom) {
      this.dom.canvas.width = val;
    }
  }
}

customElements.define("wc-wgsl-convolution-canvas", WcWgslConvolutionCanvas);
