function loadImage(url) {
  return new Promise((res, rej) => {
    const image = new Image();
    image.src = url;
    image.onload = () => res(image);
    image.onerror = rej;
  });
}

function getValuesFromEntriesRecursive(entries) {
  return entries.map((keyval) => {
    if (Array.isArray(keyval[1])) {
      return getValuesFromEntriesRecursive(keyval[1]);
    }
    return keyval[1];
  });
}

/**@constant */
const gpuTypeAlignSize = {
  bool: { align: 4, size: 4 },
  i32: { align: 4, size: 4 },
  u32: { align: 4, size: 4 },
  f32: { align: 4, size: 4 },
  f16: { align: 2, size: 2 },
  atomic: { align: 4, size: 4 },
  vec2bool: { align: 8, size: 8 },
  vec2i32: { align: 8, size: 8 },
  vec2u32: { align: 8, size: 8 },
  vec2f32: { align: 8, size: 8 },
  vec2f16: { align: 4, size: 4 },
  vec3bool: { align: 16, size: 12 },
  vec3i32: { align: 16, size: 12 },
  vec3u32: { align: 16, size: 12 },
  vec3f32: { align: 16, size: 12 },
  vec3f16: { align: 8, size: 6 },
  vec4bool: { align: 16, size: 16 },
  vec4i32: { align: 16, size: 16 },
  vec4u32: { align: 16, size: 16 },
  vec4f32: { align: 16, size: 16 },
  vec4f16: { align: 8, size: 8 },
  mat2x2f32: { align: 8, size: 16 },
  mat2x2f16: { align: 4, size: 8 },
  mat3x2f32: { align: 8, size: 24 },
  mat3x2f16: { align: 4, size: 12 },
  mat4x2f32: { align: 8, size: 32 },
  mat4x2f16: { align: 4, size: 16 },
  mat2x3f32: { align: 16, size: 32 },
  mat2x3f16: { align: 8, size: 16 },
  mat3x3f32: { align: 16, size: 48 },
  mat3x3f16: { align: 8, size: 24 },
  mat4x3f32: { align: 16, size: 64 },
  mat4x3f16: { align: 8, size: 32 },
  mat2x4f32: { align: 16, size: 32 },
  mat2x4f16: { align: 8, size: 16 },
  mat3x4f32: { align: 16, size: 48 },
  mat3x4f16: { align: 8, size: 24 },
  mat4x4f32: { align: 16, size: 64 },
  mat4x4f16: { align: 8, size: 32 },
};

/**
 * @typedef {[string,GpuType | Prop[]]} Prop
 * @typedef {Prop[]} Schema
 *
 * @param {object} data
 * @param {Schema} schema
 * @param {{ minSize?: number, buffer?: ArrayBuffer, offset?: number }} options
 */
export function pack(data, schema, options = {}) {
  const offset = options.offset ?? 0;

  if (Array.isArray(data)) {
    const { totalSize: structSize } = getAlignments(
      getValuesFromEntriesRecursive(schema),
      { minSize: options.minSize },
    );
    const outBuffer = options.buffer ??
      new ArrayBuffer(structSize * data.length);

    for (let i = 0; i < data.length; i++) {
      pack(data[i], schema, {
        minSize: options.minSize,
        buffer: outBuffer,
        offset: offset + i * structSize,
      });
    }
    return outBuffer;
  } else {
    const lastSchema = schema.at(-1);
    const lastProp = data[/**@type {Prop} */ (lastSchema)[0]];
    const count =
      (Array.isArray(lastProp) &&
          Array.isArray(/** @type {Prop} */ (lastSchema)[1]))
        ? lastProp.length
        : 1; //if last data and schema are arrays then it's an array
    const { offsets, totalSize } = getAlignments(
      getValuesFromEntriesRecursive(schema),
      { minSize: options.minSize, arrayCount: count },
    );
    const outBuffer = options.buffer ?? new ArrayBuffer(totalSize);
    const dataView = new DataView(outBuffer);

    for (let i = 0; i < schema.length; i++) {
      const [name, type] = schema[i];
      const value = data[name];
      if (value === undefined) {
        throw new Error(
          `Value lookup for prop '${name}' failed!  Double check the prop name is correct.`,
        );
      }
      //TODO: add other GPU Types
      const totalOffset = offset + offsets[i];
      switch (type) {
        case "i32": {
          dataView.setInt32(totalOffset, value, true);
          break;
        }
        case "u32": {
          dataView.setUint32(totalOffset, value, true);
          break;
        }
        case "f32": {
          dataView.setFloat32(totalOffset, value, true);
          break;
        }
        case "vec2f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);
          break;
        }
        case "vec3f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);
          dataView.setFloat32(totalOffset + 8, value[2], true);
          break;
        }
        case "vec4f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);
          dataView.setFloat32(totalOffset + 8, value[2], true);
          dataView.setFloat32(totalOffset + 12, value[3], true);
          break;
        }
        case "mat2x2f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);

          dataView.setFloat32(totalOffset + 8, value[2], true);
          dataView.setFloat32(totalOffset + 12, value[3], true);
          break;
        }
        case "mat3x3f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);
          dataView.setFloat32(totalOffset + 8, value[2], true);

          dataView.setFloat32(totalOffset + 16, value[3], true);
          dataView.setFloat32(totalOffset + 20, value[4], true);
          dataView.setFloat32(totalOffset + 24, value[5], true);

          dataView.setFloat32(totalOffset + 32, value[6], true);
          dataView.setFloat32(totalOffset + 36, value[7], true);
          dataView.setFloat32(totalOffset + 40, value[8], true);
          break;
        }
        case "mat4x4f32": {
          dataView.setFloat32(totalOffset, value[0], true);
          dataView.setFloat32(totalOffset + 4, value[1], true);
          dataView.setFloat32(totalOffset + 8, value[2], true);
          dataView.setFloat32(totalOffset + 12, value[3], true);

          dataView.setFloat32(totalOffset + 16, value[4], true);
          dataView.setFloat32(totalOffset + 20, value[5], true);
          dataView.setFloat32(totalOffset + 24, value[6], true);
          dataView.setFloat32(totalOffset + 28, value[7], true);

          dataView.setFloat32(totalOffset + 32, value[8], true);
          dataView.setFloat32(totalOffset + 36, value[9], true);
          dataView.setFloat32(totalOffset + 40, value[10], true);
          dataView.setFloat32(totalOffset + 44, value[11], true);

          dataView.setFloat32(totalOffset + 48, value[12], true);
          dataView.setFloat32(totalOffset + 52, value[13], true);
          dataView.setFloat32(totalOffset + 56, value[14], true);
          dataView.setFloat32(totalOffset + 60, value[15], true);
          break;
        }
        default: {
          if (Array.isArray(type)) {
            if (Array.isArray(value) && i !== (schema.length - 1)) {
              throw new Error("Array must be the last element in a struct!");
            }
            pack(value, /** @type {Prop[]}*/ (type), {
              buffer: outBuffer,
              offset: totalOffset,
            });
          } else {
            throw new Error(
              `Cannot pack type ${type} at prop index ${i} with value ${value}`,
            );
          }
        }
      }
    }
    return outBuffer;
  }
}

/**
 * @param {number} size
 * @param {number} smallestUnitSize
 * @param {number} minSize
 * @returns
 */
export function getPaddedSize(size, smallestUnitSize, minSize = 0) {
  const remainder = size % smallestUnitSize;
  if (remainder === 0) {
    return size > minSize ? size : minSize;
  }
  const computedSize = size + smallestUnitSize - remainder;
  return computedSize > minSize ? computedSize : minSize;
}

/**
 * @param {GpuType[]} typesToPack
 * @param {{ minSize?: number, arrayCount?: number }} options
 */
export function getAlignments(typesToPack, options = {}) {
  let offset = 0;
  let maxAlign = 0;
  const offsets = new Array(typesToPack.length);

  for (let i = 0; i < typesToPack.length; i++) {
    let align;
    let size;
    if (Array.isArray(typesToPack[i])) {
      const alignSize = getAlignments(
        /** @type {GpuType[]} */ (typesToPack[i]),
      );
      align = 16;
      size = alignSize.totalSize * (options.arrayCount ?? 1);
    } else {
      const alignSize = gpuTypeAlignSize[typesToPack[i]];
      align = alignSize.align;
      size = alignSize.size;
    }

    if (maxAlign < align) {
      maxAlign = align;
    }

    offset = getPaddedSize(offset, align);
    offsets[i] = offset;
    offset += size;
  }
  return {
    offsets,
    totalSize: getPaddedSize(offset, maxAlign, options.minSize),
  };
}

export class WcWgslConvolutionCanvas extends HTMLElement {
  #image;
  #height = 240;
  #width = 320;
  #setReady;
  #ready;
  #kernel;
  #kernelWidth;
  #kernelHeight;
  #device;
  #context;
  #vertexBufferDescriptor;
  #vertexBuffer;
  #sampler;
  #texture;
  #renderPipeline;

  static observedAttributes = ["image", "height", "width", "kernel"];
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
    if (!this.#texture || !this.#renderPipeline) return;
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
      height: this.#kernelHeight,
      width: this.#kernelWidth,
      values: this.#kernel,
    };

    const kernelData = pack(kernel, [
      ["height", "u32"],
      ["width", "u32"],
      ["values", "u32"],
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
      .then((img) => createImageBitmap(img))
      .then((bitmap) => {
        this.#image = bitmap;
        this.updateTexture()
          .then(() => this.draw());
      });
  }
  set kernel(val) {
    const valMatrix = typeof val === "string" ? JSON.parse(val) : val;

    const width = valMatrix[0].length;
    const height = valMatrix.length;
    this.#kernel = new Float32Array(valMatrix.flat());
    this.#kernelWidth = width;
    this.#kernelHeight = height;
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
}

customElements.define("wc-wgsl-convolution-canvas", WcWgslConvolutionCanvas);
