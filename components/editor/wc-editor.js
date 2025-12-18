export class WcEditor extends HTMLElement {
    static observedAttributes = ["preview-attribute"];

    #previewAttribute = "value";

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onUpdate = this.onUpdate.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
                <style>
                    :host { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
                    slot[name=preview] { grid-row: 1 / 2; grid-column: 2 / 3; }
                    slot[name=editor] { grid-row: 1 / 2; grid-column: 1 / 2; }
                    textarea { white-space: pre-wrap; }
                </style>
                <slot name="editor"></slot>
                <slot name="preview"></slot>
        `;
    }
    registerDom(){
        this.dom = {
            preview: this.shadow.querySelector("slot[name='preview']").assignedElements({ flatten: false })[0],
            editor: this.shadow.querySelector("slot[name='editor']").assignedElements({ flatten: false })[0]
        };
    }
    attachEvents(){
        this.dom.editor.addEventListener("input", this.onUpdate);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    onUpdate(e){
        const value = e.target.value;
        this.dom.preview[this.#previewAttribute] = value;
    }
    get ["preview-attribute"](){
        return this.#previewAttribute;
    }
    set ["preview-attribute"](value){
        this.#previewAttribute = value;
    }
}

customElements.define("wc-editor", WcEditor);