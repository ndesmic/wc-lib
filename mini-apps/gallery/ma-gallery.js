import { createElement } from "../../libs/dom-utils.js";
import systemCss from "../../css/system.css" with { type: "css" };
import galleryCss from "./ma-gallery.css" with { type: "css" };

export class MaGallery extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onFileChanged = this.onFileChanged.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets.push(systemCss, galleryCss);
        this.shadow.innerHTML = `
            <ul id="images"></ul>
            <slot></slot>
        `;
    }
    registerDom(){
        this.dom = {
            directoryPicker: this.querySelector(".directory-picker"),
            images: this.shadowRoot.querySelector("#images")
        };
    }
    attachEvents(){
        this.dom.directoryPicker.addEventListener("directory-selected", this.onFileChanged);
    }
    async onFileChanged(e){
      const directoryHandle = e.detail.handle;
      const entries = await directoryHandle.values();
      this.dom.images.innerHTML = "";
      for await(const entry of entries){

        //Todo filter valid images
        if(entry.kind === "directory") continue; //maybe show nested...
        const fileHandle = await directoryHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);

        const li = createElement("li", {
            children: createElement("img", {
                attrs: {
                    src: url
                }
            })
        });
        this.dom.images.append(li);
      }
    }
}

customElements.define("ma-gallery", MaGallery);