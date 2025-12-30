import { getGaussianBoxBlurKernels } from "../../libs/convolution-utils.js";

export class MaBlurConvolution extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.registerDom();
        this.attachEvents();
        this.onUpdate();
    }
    bind(){
        this.onUpdate = this.onUpdate.bind(this);
    }
    registerDom(){
        this.dom = {
            inputStdX: this.querySelector(".std-x"),
            inputStdY: this.querySelector(".std-y"),
            output: this.querySelector(".output"),
        };
    }
    attachEvents(){
       this.dom.inputStdX.addEventListener("input", this.onUpdate);
       this.dom.inputStdY.addEventListener("input", this.onUpdate);
    }
    onUpdate(){
        const stdX = parseFloat(this.dom.inputStdX.value);
        const stdY = parseFloat(this.dom.inputStdY.value);
        const kernels = getGaussianBoxBlurKernels(stdX, stdY, 3);
        this.dom.output.value = JSON.stringify(kernels, null, 4);
    }
}

customElements.define("ma-blur-convolution", MaBlurConvolution);