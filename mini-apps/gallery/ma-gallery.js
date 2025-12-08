export class MaGallery extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onFileChanged = this.onFileChanged.bind(this);
    }
    registerDom(){
        this.dom = {
            file: this.querySelector(".file-input"),
        };
    }
    attachEvents(){
        this.dom.file.addEventListener("change", this.onFileChanged);
    }
    onFileChanged(){
      
    }
}

customElements.define("ma-gallery", MaGallery);