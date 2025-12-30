import { getGaussianBoxBlurKernels, getGaussianBlurKernel } from "../../libs/convolution-utils.js";

export class MaConvolutionEditor extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.dom.gridInput.onInput();
    }
    bind(){
        this.onApplyBoxClick = this.onApplyBoxClick.bind(this);
        this.onApplyGaussianClick = this.onApplyGaussianClick.bind(this);
    }
    registerDom(){
        this.dom = {
            applyBox: document.querySelector(".btn-apply-box"),
            applyGaussian: document.querySelector(".btn-apply-gaussian"),
            stdX: document.querySelector(".std-x"),
            stdY: document.querySelector(".std-y"),
            gridInput: document.querySelector("wc-multi-grid-input")
        };
    }
    attachEvents(){
        this.dom.applyBox.addEventListener("click", this.onApplyBoxClick);
        this.dom.applyGaussian.addEventListener("click", this.onApplyGaussianClick);
    }
    onApplyBoxClick(){
        const stdX = parseFloat(this.dom.stdX.value);
        const stdY = parseFloat(this.dom.stdY.value);

        const kernels = getGaussianBoxBlurKernels(stdX, stdY, 3);
        this.dom.gridInput.values = kernels;
        this.dom.gridInput.instances = kernels.length;
        this.dom.gridInput.onInput();
    }
    onApplyGaussianClick(){
        const stdX = parseFloat(this.dom.stdX.value);
        const stdY = parseFloat(this.dom.stdY.value);

        const kernel = getGaussianBlurKernel(stdX, stdY);
        this.dom.gridInput.values = [kernel];
        this.dom.gridInput.instances = 1;
        this.dom.gridInput.onInput();
    }
}

customElements.define("ma-convolution-editor", MaConvolutionEditor);
