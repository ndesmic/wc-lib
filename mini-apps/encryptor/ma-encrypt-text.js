import { encryptText } from "./encrypt-libs.js";;

export class MaEncryptText extends HTMLElement {
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
            passphrase: this.querySelector(".encrypt-text-passphrase"),
            inputText: this.querySelector(".encrypt-input-text"),
            outputText: this.querySelector(".encrypt-output-text")
        };
    }
    attachEvents(){
        this.dom.passphrase.addEventListener("input", this.update);
        this.dom.inputText.addEventListener("input", this.update);
    }
    async update(){
        const text = this.dom.inputText.value;
        const passphrase = this.dom.passphrase.value;

        const cipherText = await encryptText(text, passphrase)

        this.dom.outputText.value = cipherText;
    }
}

customElements.define("ma-encrypt-text", MaEncryptText);