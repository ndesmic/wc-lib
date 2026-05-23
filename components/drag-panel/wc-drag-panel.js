import dragPanelCss from "./wc-drag-panel.css" with { type: "css" };

export class WcDragPanel extends HTMLElement {
    #position = [0,0];
    #dragStart = [0,0];

	static observedAttributes = [];

	connectedCallback() {
		this.bind();
		this.renderDom();
		this.registerDom();
		this.attachEvents();
	}
	bind() {
        this.onHandlePointerCancel = this.onHandlePointerCancel.bind(this);
        this.onHandlePointerDown = this.onHandlePointerDown.bind(this);
        this.onHandlePointerMove = this.onHandlePointerMove.bind(this);
        this.onHandlePointerUp = this.onHandlePointerUp.bind(this);
	}
	renderDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets.push(dragPanelCss);
		this.shadowRoot.innerHTML = `
            <div id="panel">
                <div id="handle"></div>
                <slot></slot>
            </div>
        `;
	}
	registerDom() {
		this.dom = {
			handle: this.shadowRoot.querySelector("#handle"),
		};
	}
	attachEvents() {
		this.dom.handle.addEventListener("pointerdown", this.onHandlePointerDown);
        this.dom.handle.addEventListener("pointercancel", this.onPointerCancel);
	}
	onHandlePointerDown(e) {
		this.setPointerCapture(e.pointerId);
		this.addEventListener("pointermove", this.onHandlePointerMove);
		this.addEventListener("pointerup", this.onHandlePointerUp);
        this.#dragStart = [e.pageX, e.pageY];
	}
	onHandlePointerMove(e) {
		const moveX = (e.pageX - this.#dragStart[0]);
		const moveY = (e.pageY - this.#dragStart[1]);
        const offsetX = this.#position[0] + moveX;
        const offsetY = this.#position[1] + moveY;
		//this.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        this.style.left = `${offsetX}px`;
        this.style.top = `${offsetY}px`;
        this.#position = [offsetX, offsetY];
        this.#dragStart = [e.pageX, e.pageY];
	}

	onHandlePointerUp(e) {
		this.releasePointerCapture(e.pointerId);
		this.removeEventListener("pointermove", this.onHandlePointerMove);
		this.removeEventListener("pointerup", this.onHandlePointerUp);
	}

	onHandlePointerCancel(e) {
		e.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this.onPointerMove);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
}

customElements.define("wc-drag-panel", WcDragPanel);
