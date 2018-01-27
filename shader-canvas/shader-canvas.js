customElements.define("shader-canvas",
	class extends HTMLElement {
		static get observedAttributes(){
			return [];
		}
		constructor(){
			super();
			this.bind(this);
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
			element.cacheDom = element.cacheDom.bind(element);
			element.createShadowDom = element.createShadowDom.bind(element);
			element.bootGpu = element.bootGpu.bind(element);
			element.compileShaders = element.compileShaders.bind(element);
			element.attachShaders = element.attachShaders.bind(element);
			element.render = element.render.bind(element);
		}
		connectedCallback(){
			this.createShadowDom();
			this.cacheDom();
			this.attachEvents();
			this.bootGpu();
		}
		createShadowDom(){
			this.shadow = this.attachShadow({ mode: "open" });
			this.shadow.innerHTML = `
				<style>
					:host { display: block; }
					canvas { width: 320px; height: 240px; }
				</style>
				<canvas></canvas>
			`;
		}
		cacheDom(){
			this.dom = {};
			this.dom.canvas = this.shadow.querySelector("canvas");
		}
		attachEvents(){

		}
		bootGpu(){
			this.context = this.dom.canvas.getContext("webgl");
			this.program = this.context.createProgram();
			this.compileShaders();
			this.attachShaders();
			this.context.linkProgram(this.program);
			this.context.useProgram(this.program);

			this.quad = new Float32Array([
				-1.0, 1.0,
				-1.0, -1.0,
				1.0, -1.0,
				1.0, 1.0
			]);
			this.quadBuffer = this.context.createBuffer();
			this.context.bindBuffer(this.context.ARRAY_BUFFER, this.quadBuffer);
			this.context.bufferData(this.context.ARRAY_BUFFER, this.quad, this.context.STATIC_DRAW);
			let positionLocation = this.context.getAttribLocation(this.program, "aVertexPosition");
			this.context.enableVertexAttribArray(positionLocation);
			this.context.vertexAttribPointer(positionLocation, 2, this.context.FLOAT, false, 0, 0);
			this.render();
		}
		compileShaders(){
			const vertexShaderText = `
				attribute vec3 aVertexPosition;
				void main(){
					gl_Position = vec4(aVertexPosition, 1.0);
				}
			`;
			this.vertexShader = this.context.createShader(this.context.VERTEX_SHADER);
			this.context.shaderSource(this.vertexShader, vertexShaderText);
			this.context.compileShader(this.vertexShader);

			if(!this.context.getShaderParameter(this.vertexShader, this.context.COMPILE_STATUS)){
				console.error("Failed to compile vertext shader");
			}

			const fragmentShaderText = this.textContent;
			this.fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER);
			this.context.shaderSource(this.fragmentShader, fragmentShaderText);
			this.context.compileShader(this.fragmentShader);

			if(!this.context.getShaderParameter(this.fragmentShader, this.context.COMPILE_STATUS)){
				console.error("Failed to compile fragment shader");
			}
		}
		attachShaders(){
			this.context.attachShader(this.program, this.vertexShader);
			this.context.attachShader(this.program, this.fragmentShader);
		}
		render(){
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
			this.context.drawArrays(this.context.TRIANGLE_FAN, 0, this.quad.length / 2); //vert size is 2
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
		//TODO: throw away program on detach
	}
)
