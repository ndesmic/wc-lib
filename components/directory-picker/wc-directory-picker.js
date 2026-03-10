import { IdbStorage } from "../../libs/idb-storage.js";
import systemCss from "../../css/system.css" with { type: "css" };

export class WcDirectoryPicker extends HTMLElement {
	#idb;
	#handle;
	#handleName;

    static observedAttributes = ["handle-name"];

    constructor(){
        super();
        this.#idb = new IdbStorage();
    }

	async connectedCallback() {
		this.bind(this);
		this.renderDom();
		this.registerDom();
		this.attachEvents();

        this.#handleName = this.getAttribute("handle-name");
		if (this.#handleName) {
			this.#handle = await this.#idb.get(this.#handleName);
            this.onDirectorySelected();
		}
	}
	bind() {
		this.openDirectory = this.openDirectory.bind(this);
	}
	renderDom() {
		this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets.push(systemCss);
		this.shadowRoot.innerHTML = `
            <button id="open-btn">Open Directory</button>
        `;
	}
	registerDom() {
		this.dom = {
			openButton: this.shadowRoot.querySelector("#open-btn"),
		};
	}
	attachEvents() {
		this.dom.openButton.addEventListener("click", this.openDirectory);
	}
	async openDirectory() {
		this.#handle = await showDirectoryPicker();
        if(this.#handleName){
		    await this.#idb.set(this.#handleName, this.#handle);
        }
		this.onDirectorySelected();
	}
	onDirectorySelected() {
		const event = new CustomEvent("directory-selected", {
			detail: { handle: this.#handle },
		});
		this.dispatchEvent(event);
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
	set ["handle-name"](value) {
		this.#handleName = value;
		this.#handle = this.#idb.get(this.#handleName);
	}
	get ["handle-name"]() {
		return this.#handleName;
	}
}

customElements.define("wc-directory-picker", WcDirectoryPicker);
