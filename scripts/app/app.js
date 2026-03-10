export class {{appTitleCase}} extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
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

customElements.define("{{prefixedAppKebabCase}}", {{appTitleCase}});