import {{componentCamelCase}}Css from "./wc-{{componentKebabCase}}.css" with { type: "css" };

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
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets.push({{componentCamelCase}}Css);
        this.shadowRoot.innerHTML = `
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

customElements.define("{{prefixedComponentKebabCase}}", {{componentTitleCase}});
