import { decryptText } from "./encrypt-libs.js";

export class MaDecryptText extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.update = this.update.bind(this);
    }
    registerDom(){
        this.dom = {
            passphrase: this.querySelector(".decrypt-text-passphrase"),
            inputText: this.querySelector(".decrypt-input-text"),
            outputText: this.querySelector(".decrypt-output-text")
        };
    }
    attachEvents(){
        this.dom.passphrase.addEventListener("input", this.update);
        this.dom.inputText.addEventListener("input", this.update);
    }
    async update(){
        const text = this.dom.inputText.value;
        const passphrase = this.dom.passphrase.value;

        const decryptResult = await decryptText(text, passphrase);

        if(!decryptResult.success){
            this.dom.outputText.classList.add("error");
        } else {
            this.dom.outputText.classList.remove("error");
            this.dom.outputText.value = decryptResult.payload;
        }
    }
}

customElements.define("ma-decrypt-text", MaDecryptText);