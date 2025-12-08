import { decryptBytes } from "./encrypt-libs.js";

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

export class MaDecryptFile extends HTMLElement {
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
            passphrase: this.querySelector(".decrypt-file-passphrase"),
            output: this.querySelector(".decrypt-file-output"),
            file: this.querySelector(".decrypt-file-file"),
            download: this.querySelector(".decrypt-file-download"),
            preview: this.querySelector(".decrypt-file-preview")
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
            this.preview();
        } else {
            this.dom.download.disabled = true;
        }
    }
    async preview(){
        const file = this.dom.file.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const passphrase = this.dom.passphrase.value;

        const result = await decryptBytes(arrayBuffer, passphrase);
        if(!result.success){
            this.dom.output.classList.add("warn");
            this.dom.output.value = `Hint: ${result.hint}`;
        } else {
            this.dom.output.classList.remove("warn");
            this.dom.output.value = "";
            const blob = new Blob([result.payload], { type: "application/octet-stream" });
            blob.name = file.name.split(".").slice(0,-1).join(".");
            this.dom.preview.show([blob]);
        }
    }
    async onDownloadClick(){
        const file = this.dom.file.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const passphrase = this.dom.passphrase.value;

        const result = await decryptBytes(arrayBuffer, passphrase);

        if(!result.success){
            this.dom.output.classList.add("warn");
            this.dom.output.value = `Hint: ${result.hint}`;
        } else {
            this.dom.output.classList.remove("warn");
            downloadArrayBuffer(result.payload, file.name.replace(/\.crypt$/, ""));
        }
    }
}

customElements.define("ma-decrypt-file", MaDecryptFile);