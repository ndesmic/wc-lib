import "./wc-wgsl-shader-canvas.js";
/**
 * dedents the text based on first line
 * @param {string} text 
 */
export function dedent(text){
    const lines = text.split("\n");
    let char = lines[0].charAt(0);
    let count = 0;
    const spacingChar = char;
    if(!/[ \t]/.test(spacingChar)){
        return text;
    }
    while(char === spacingChar){
        count++;
        char = lines[0].charAt(count);
    }
    if(count === 0){
        return text;
    }
    const regExp = new RegExp(`^${spacingChar}{${count}}`, "us");
    return lines.map(line => line.replace(regExp, "")).join("\n");
}

/**
 * Trims only lines from the text  
 * @param {string} text 
 * @returns 
 */
export function trimLines(text){
    return text.replace(/^(\r?\n)+/us, "")
        .replace(/(\r?\n)+$/us, "")
}

export class WcWgslShaderEditor extends HTMLElement {
    #image;
    #code;

	static observedAttributes = ["image"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
        this.updateCode = this.updateCode.bind(element);
	}
	createShadowDom() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
			 :host {
				 display: grid;
                 grid-template-columns: 50% 50%;
                 grid-gap: 1rem;
                 textarea {
                    field-sizing: content;
                 }
			 }
			</style>
            <textarea id="text" value=${this.code}></textarea>
            <wc-wgsl-shader-canvas id="canvas" image=${this.image}></wc-wgsl-shader-canvas>
        `;
	}
	async connectedCallback() {
		this.createShadowDom();
		this.cacheDom();
        this.attachEvents();
        this.code = dedent(trimLines(this.dom.script.textContent)).trim();
        this.dom.text.value = this.code;
	}
	cacheDom() {
		this.dom = {
			canvas: this.shadowRoot.querySelector("#canvas"),
			text: this.shadowRoot.querySelector("#text"),
            script: this.querySelector("script")
		};
	}
    attachEvents(){
        this.dom.text.addEventListener("input", this.updateCode);
    }
    updateCode(e){
        this.code = e.target.value;
    }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue
		}
	}
    set image(val) {
        this.#image = val;
        if(this.dom?.canvas){
            this.dom.canvas.image = val;
        }
    }
    get image(){
        return this.#image;
    }
    get code(){
        return this.#code;
    }
    set code(val){
        this.#code = val;
        if(this.dom?.canvas){
            this.dom.canvas.code = this.code;
        }
    }
}

customElements.define("wc-wgsl-shader-editor", WcWgslShaderEditor);