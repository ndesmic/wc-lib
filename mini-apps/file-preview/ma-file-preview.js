export class MaFilePreview extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onFileChange = this.onFileChange.bind(this);
    }
    registerDom(){
        this.dom = {
            file: this.querySelector("input[type=file]"),
            preview: this.querySelector("wc-file-preview")
        };
    }
    attachEvents(){
        this.dom.file.addEventListener("change", this.onFileChange);
    }
    onFileChange(e){
        this.dom.preview.show(Array.from(e.target.files));
    }
}

customElements.define("ma-file-preview", MaFilePreview);