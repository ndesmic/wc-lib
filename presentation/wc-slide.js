export class WcSlide extends HTMLElement {
	static observedAttributes = [];

	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.render = element.render.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
				:host { position: absolute; inline-size: 100%; block-size: 100%; display: block; left: 0; top: 0; background: var(--slide-bg, #fff); }
				::slotted(h1) { margin: 0; padding: 0; }
            </style>
			<div id="slide">
            	<slot></slot>
			</div>
        `;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
	}
	cacheDom() {

	}
	attachEvents() {

	}
}

customElements.define("wc-slide", WcSlide);