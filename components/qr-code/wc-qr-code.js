import { drawQrCanvas } from "./canvas-utils.js";
import { QrCanvas, masks } from "./qr-canvas.js";
import { qrEncodeData, getFormatString, getVersionInfoString } from "./qr-utils.js";
import QrCodeCss from "./wc-qr-code.css" with { type: "css" };

export class WcQrCode extends HTMLElement {
	#errorLevel;
	#value;
	#mask;
	#scale;
	#dom;
	static get observedAttributes() {
		return ["value", "errorlevel", "mask", "scale"]
	}
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.cacheDom.bind(element);
	}
	connectedCallback() {
		this.prerender();
		this.cacheDom();
		this.render();
	}
	prerender() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [QrCodeCss];
		this.shadowRoot.innerHTML = `
			<canvas id="qr"></canvas>
		`;
	}
	cacheDom() {
		this.#dom = {
			qr: this.shadowRoot.querySelector("#qr")
		};
	}
	render() {
		if (!this.#errorLevel || !this.#value || !this.#dom) return;
		const {
			encodedData,
			version
		} = qrEncodeData(this.#value, this.#errorLevel);
		const matrix = QrCanvas.fromVersion(version);
		matrix.drawPayloadData(encodedData);
		const mask = this.#mask ?? matrix.getBestMask();
		matrix.applyMask(masks[mask]);
		matrix.drawFormatString(getFormatString(this.#errorLevel, mask));
		if (version >= 7) {
			matrix.drawVersionString(getVersionInfoString(version));
		}
		const scale = this.#scale ?? 1;
		this.#dom.qr.height = matrix.height * scale;
		this.#dom.qr.width = matrix.width * scale;
		const context = this.#dom.qr.getContext("2d");
		drawQrCanvas(context, matrix, { scale });
	}
	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "errorlevel": {
				this.errorLevel = newValue;
				break;
			}
			default: {
				this[name] = newValue;
			}
		}
	}
	set errorLevel(value) {
		this.#errorLevel = value;
		this.render();
	}
	set value(value) {
		this.#value = value;
		this.render();
	}
	set mask(value) {
		this.#mask = parseInt(value, 10);
		this.render();
	}
	set scale(value) {
		this.#scale = parseInt(value, 10);
		this.render();
	}
}

if(customElements){
	customElements.define("wc-qr-code", WcQrCode);
}