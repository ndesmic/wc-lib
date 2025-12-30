export class {{appTitleCase}} extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.onColorInput();
    }
    bind(){
        
    }
    registerDom(){
        this.dom = {
        };
    }
    attachEvents(){
    }
}

customElements.define("{{appKebabCase}}", AppTitleCase);