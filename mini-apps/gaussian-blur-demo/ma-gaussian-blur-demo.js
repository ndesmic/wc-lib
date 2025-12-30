import { getGaussianBlurKernel, getGaussianBoxBlurKernels } from "../../libs/convolution-utils.js";

export class MaGaussianBlurDemo extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.onStdChange();
    }
    bind(){
        this.onStdInput = this.onStdInput.bind(this);
    }
    registerDom(){
        this.dom = {
            std: this.querySelector(".std"),
            guassianDemo: this.querySelector(".gaussian-demo"),
            boxDemo: this.querySelector(".box-demo")
        };
    }
    attachEvents(){
        this.dom.std.addEventListener("input", this.onStdChange);
    }
    onStdInput(e){
        const value = parseFloat(this.dom.std.value);
        this.dom.guassianDemo.kernels = [getGaussianBlurKernel(value, value)];
        this.dom.boxDemo.kernels = getGaussianBoxBlurKernels(value, value, 3);
    }
}

customElements.define("ma-gaussian-blur-demo", MaGaussianBlurDemo);