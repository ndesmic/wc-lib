export class MaSvgEditor extends HTMLElement {
	connectedCallback() {
		this.bind(this);
		this.registerDom();
		this.attachEvents();
	}
	bind() {
	}
	registerDom() {
		this.dom = {};
	}
	attachEvents() {
	}
}

customElements.define("ma-svg-editor", MaSvgEditor);
