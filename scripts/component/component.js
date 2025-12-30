export class {{componentTitleCase}} extends HTMLElement {
    static observedAttributes = [];

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){

    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
                <style>
                    :host {  }
                </style>
        `;
    }
    registerDom(){
        this.dom = {
        };
    }
    attachEvents(){
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
}

customElements.define("{{componentKebabCase}}", {{componentTitleCase}});