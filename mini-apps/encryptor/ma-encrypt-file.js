import { encryptBytes } from "./encrypt-libs.js";

function downloadArrayBuffer(arrayBuffer, name){
    const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
    downloadBlob(blob, name);
}
function downloadBlob(blob, name){
    const url = URL.createObjectURL(blob);
    downloadUrl(url, name);
    URL.revokeObjectURL(url);
}
function downloadUrl(url, name){
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}

export class MaEncryptFile extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.updateUi = this.updateUi.bind(this);
        this.onDownloadClick = this.onDownloadClick.bind(this);
    }
    registerDom(){
        this.dom = {
            passphrase: this.querySelector(".encrypt-file-passphrase"),
            passphraseHint: this.querySelector(".encrypt-file-passphrase-hint"),
            file: this.querySelector(".encrypt-input-file"),
            download: this.querySelector(".encrypt-output-file")
        };
    }
    attachEvents(){
        this.dom.file.addEventListener("change", this.updateUi);
        this.dom.passphrase.addEventListener("input", this.updateUi);
        this.dom.download.addEventListener("click", this.onDownloadClick);
    }
    updateUi(){
        if(this.dom.file.files.length > 0 && this.dom.passphrase.value.length > 0){
            this.dom.download.disabled = false;
        } else {
            this.dom.download.disabled = true;
        }
    }
    async onDownloadClick(){
        const file = this.dom.file.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const passphrase = this.dom.passphrase.value;
        const hint = this.dom.passphraseHint.value;

        const encryptedBytes = await encryptBytes(arrayBuffer, passphrase, hint);

        downloadArrayBuffer(encryptedBytes, `${file.name}.crypt`)
    }
}

customElements.define("ma-encrypt-file", MaEncryptFile);