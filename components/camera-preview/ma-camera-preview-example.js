class MaCameraPreviewExample extends HTMLElement {
	connectedCallback() {
		const flipX = this.querySelector("#flip-x");
		const cameraPreview = this.querySelector("wc-camera-preview");

		flipX.addEventListener("change", (e) => {
			const isFlipped = e.target.checked;
			cameraPreview["flip-x"] = isFlipped;
		});
	}
}

customElements.define("ma-camera-preview-example", MaCameraPreviewExample);
