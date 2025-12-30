import { accessProperty } from "../../libs/object-utils.js";

export class WcEditor extends HTMLElement {
    static observedAttributes = ["preview-attribute", "editor-event", "editor-event-prop"];

    #previewAttribute = "value";
    #editorEvent = "input";
    #editorEventProp = "target.value";

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
        this.dom.editor.addEventListener(this.#editorEvent, this.onUpdate);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    onUpdate(e){
        const value = accessProperty(e, this.#editorEventProp);
        this.dom.preview[this.#previewAttribute] = value;
    }
    get ["editor-event"](){
        return this.#editorEvent;
    }
    set ["editor-event"](value){
        this.dom?.editor.removeEventListener(this.#editorEvent, this.onUpdate);
        this.#editorEvent = value;
        this.dom?.editor.addEventListener(this.#editorEvent, this.onUpdate);
    }

    get ["editor-event-prop"](){
        return this.#editorEventProp;
    }
    set ["editor-event-prop"](value){
        this.#editorEventProp = value;
    }

    get ["preview-attribute"](){
        return this.#previewAttribute;
    }
    set ["preview-attribute"](value){
        this.#previewAttribute = value;
    }
}

customElements.define("wc-editor", WcEditor);