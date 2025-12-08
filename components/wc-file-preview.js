import { classifyFileType } from "../libs/file-tools.js";

export class WcFilePreview extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.show = this.show.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
                <style>
                    #preview {
                        display: flex;
                        flex-flow: column nowrap;
                        gap: 1rem;
                        align-items: center;

                        img,
                        video {
                          max-width:100%;
                          max-height: 100%;
                        }
                        
                    }
                </style>
                <div id="preview"></div>
        `;
    }
    registerDom(){
        this.dom = {
            preview: this.shadow.querySelector("#preview"),
        };
    }
    attachEvents(){

    }
    show(files){
        if(!Array.isArray(files)){
            files = [files];
        }
        this.dom.preview.innerHTML = "";
        for(const file of files){
            const ext = file.name.split(".").at(-1);
            const type = classifyFileType(ext);
            let el;

            switch(type){
                case "image": {
                    el = document.createElement("img");
                    const url = URL.createObjectURL(file);
                    el.src = url;
                    break;
                }
                case "text": {
                    const reader = new FileReader();
                    el = document.createElement("output");

                    reader.onload = e => {
                        el.value = e.target.result
                    };
                    reader.readAsText(file);
                    break;
                }
                case "video": {
                    el = document.createElement("video");
                    el.controls = true;
                    const url = URL.createObjectURL(file);
                    el.src = url;
                    break;
                }
                case "audio": {
                    el = document.createElement("audio");
                    el.controls = true;
                    const url = URL.createObjectURL(file);
                    el.src = url;
                    break;
                }
                default: {
                    el = document.createElement("div");
                    el.textContent = "Preview not available"
                }
            }

            this.dom.preview.appendChild(el);
        }
    }
}

customElements.define("wc-file-preview", WcFilePreview);