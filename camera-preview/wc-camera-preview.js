export class WcCameraPreview extends HTMLElement {
	static observedAttributes = ["height", "width"];
	#stream;
	#height = 240;
	#width = 320;
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.render = element.render.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.onClick = element.onClick.bind(element);
		element.requestVideo = element.requestVideo.bind(element);
		element.getImage = element.getImage.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
                :host{ display: block; }
            </style>
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
		this[name] = newValue;
	}
	onClick(){
		this.dom.message.style.display = "none";
		this.removeEventListener("click", this.onClick);
		this.requestVideo();
	}
	getImage(){
		const canvas = document.createElement("canvas");
		canvas.height = this.#height;
		canvas.width = this.#width;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(this.dom.preview, 0, 0);
		return canvas.toDataURL();
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
}

customElements.define("wc-camera-preview", WcCameraPreview);