//import systemCss from "../../css/system.css" with { type: "css" };
import { parseBoolean } from "../../libs/wc-utils.js";
import cameraPreviewCss from "./wc-camera-preview.css" with { type: "css" };

export class WcCameraPreview extends HTMLElement {
	static observedAttributes = ["height", "width", "flip-x"];
	#stream;
	#height = 240;
	#width = 320;
	#flipX = false;
	#canvas;
	#context;

	constructor() {
		super();
		this.bind();
	}
	bind() {
		this.attachEvents = this.attachEvents.bind(this);
		this.render = this.render.bind(this);
		this.cacheDom = this.cacheDom.bind(this);
		this.onClick = this.onClick.bind(this);
		this.requestVideo = this.requestVideo.bind(this);
		this.getImageUrl = this.getImageUrl.bind(this);
		this.getBitmapImageSource = this.getBitmapImageSource.bind(this);
	}
	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets.push(cameraPreviewCss);
		this.shadowRoot.innerHTML = `
			<video id="preview" width="${this.#width}" height="${this.#height}" autoplay></video>
			<div id="message">Click To Play<div>
        `;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
	}
	cacheDom() {
		this.dom = {
			preview: this.shadowRoot.querySelector("#preview"),
			message: this.shadowRoot.querySelector("#message")
		};
	}
	async requestVideo(){
		try {
			this.#stream = await navigator.mediaDevices.getUserMedia({
				video: {
					height: { min: this.#height },
					width: { min: this.#width }
				}
			});
			this.dom.preview.srcObject= this.#stream;
		} catch(e){
			this.dom.message.textContent = e.message;
			this.dom.message.style.display = "block"
			this.dom.preview.style.display = "none";
		}
	}
	attachEvents() {
		this.addEventListener("click", this.onClick)
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if(oldValue != newValue){
			this[name] = newValue;
		}
	}
	onClick(){
		this.dom.message.style.display = "none";
		this.removeEventListener("click", this.onClick);
		this.requestVideo();
	}
	getImageUrl(){
		const canvas = this.getImage();
		return canvas.toDataURL();
	}
	getBitmapImageSource(flipX){
		this.#canvas = document.createElement("canvas");
		this.#canvas.height = this.#height;
		this.#canvas.width = this.#width;

		this.#context = canvas.getContext("2d");
		if(flipX){
			this.#context.translate(width, 0);
			this.#context.scale(-1, 1);
		}
		this.#context.drawImage(this.dom.preview, 0, 0);
		return this.#canvas;
	}
	set width(val){
		this.#width = parseInt(val);
		this.dom.preview.width = this.#width;
		this.requestVideo();
	}
	set height(val){
		this.#height = parseInt(val);
		this.dom.preview.height = this.#height;
		this.requestVideo();
	}
	set ["flip-x"](value) {
		const newValue = parseBoolean(value);
		if (newValue !== this.#flipX) {
			this.#flipX = newValue;
			if (this.#flipX) {
				this.dom.preview.style = "transform: scaleX(-1)";
			} else {
				this.dom.preview.style = "";
			}
		}
	}
}

customElements.define("wc-camera-preview", WcCameraPreview);
