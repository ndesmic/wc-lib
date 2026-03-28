export class MaClaheDemo extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.onStdChange();
    }
    bind(){
        this.onFileChange = this.onFileChange.bind(this);
    }
    registerDom(){
        this.dom = {
            imageInput: this.querySelector(".image-input"),
            clahe: this.querySelector(".clahe-canvas")
        };
    }
    attachEvents(){
        this.dom.imageInput.addEventListener("change", this.onFileChange);
    }
}

customElements.define("ma-clahe-demo", MaClaheDemo);