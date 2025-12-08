import { MidiFile } from "./midi.js";

function loadFile(url) {
	return fetch(url).then(r => r.arrayBuffer());
}

export class WcMidiPlayer extends HTMLElement {
	#src;
	static observedAttributes = ["src"];
	constructor() {
		super();
		this.bind(this);
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
				}	
            </style>
        `;
	}
	bind(element) {
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
	}
	async load(){
		const file = await loadFile(this.#src);
		const midi = new MidiFile(file);
	}
	connectedCallback() {
		this.cacheDom();
		this.attachEvents();
		this.load();
	}
	cacheDom() {
		this.dom = {
		};
	}
	attachEvents() {
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
	set src(val) {
		this.#src = val;
	}
}

customElements.define("wc-midi-player", WcMidiPlayer);
