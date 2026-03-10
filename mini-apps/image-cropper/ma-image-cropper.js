export class MaImageCropper extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onFileChange = this.onFileChange.bind(this);
        this.onRectangleChanged = this.onRectangleChanged.bind(this);
        this.onImagePointerDown = this.onImagePointerDown.bind(this);
        this.onImageLoad = this.onImageLoad.bind(this);
    }
    registerDom(){
        this.dom = {
            inputFile: this.querySelector(".input-file"),
            inputRectangle: this.querySelector(".input-rectangle"),
            image: this.querySelector(".image"),
            imageContainer: this.querySelector(".image-container")
        };
    }
    attachEvents(){
        this.dom.inputFile.addEventListener("change", this.onFileChange);
        this.dom.image.addEventListener("pointerdown", this.onImagePointerDown);
        this.dom.image.addEventListener("load", this.onImageLoad);
    }
    onFileChange(e){
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        this.dom.image.src = url;
        if(!this.dom.inputRectangle){
            this.dom.inputRectangle = document.createElement("wc-rectangle-input");
            this.dom.inputRectangle.addEventListener("rectangle-input", this.onRectangleChanged);
            this.dom.imageContainer.appendChild(this.dom.inputRectangle);
        }
    }
    onRectangleChanged(e){
        console.log(e);
    }
    onImagePointerDown(e){
        e.preventDefault();
    }
    onImageLoad(){
        this.dom.inputRectangle.left = 0;
        this.dom.inputRectangle.top = 0;
        this.dom.inputRectangle.right = this.dom.image.width;
        this.dom.inputRectangle.bottom = this.dom.image.height;
    }
}

customElements.define("ma-image-cropper", MaImageCropper);