import { classifyFileType } from "./libs/file-tools.js";
import { checkAABB, checkPointInside } from "./libs/geometry-utils.js";
import { parseTextMap } from "./libs/keyvals.js";

function getDocumentRect(element){
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
        right: rect.left + window.scrollX + rect.width,
        bottom: rect.top + window.scrollY + rect.height
    };
}

export class WcDirectoryListing extends HTMLElement {
    static observedAttributes = ["icon-map"];

    #selectedEntries = new Set();
    #entryMap = new Map();
    #domMap = new Map();
    #elementArray = []; 
    #directoryHandle = null;

    #iconMap = {};

    #isDragging = false;
    #dragStart = null;
    #lastClicked = null;
    #cachedRects = new Map();

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
        this.clearSelections = this.clearSelections.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
                <style>
                    :host {
                        position: relative;
                        overflow-y: auto;
                        border: 1px solid var(--border);
                    }
                    ul {
                        display: flex;
                        flex-flow: column nowrap;
                        gap: 0;
                        align-items: stretch;
                        margin: 0;
                        padding: 0;
                    }
                    li {
                        list-style: none;
                        button::before {
                            content: "📄";
                        }

                        &.directory {
                            button::before {
                                content: "📁";
                            }
                        }
                        &.image {
                            button::before {
                                content: "🖼️";
                            }
                        }
                        &.video {
                            button::before {
                                content: "🎞️";
                            }
                        }
                        &.audio {
                            button::before {
                                content: "🎶";
                            }
                        }
                        &.compressed {
                            button::before {
                                content: "🗜️";
                            }
                        }
                        &.archive {
                            button::before {
                                content: "🗄️";
                            }
                        }
                        &:where(:has(button:hover)) {
                            background-color: var(--primary-light-2);
                        }
                        &:where(:has(button:active)),
                        &.selected,
                        &.selecting {
                            background-color: var(--primary-light-1);
                        }
                    }
                    button {
                        border: none;
                        background: none;
                        width: 100%;
                        text-align: left;
                        padding: 0;
                    }
                    .drag-box {
                        position: fixed;
                        border: 1px solid var(--primary-medium);
                        background-color: var(--primary-light-2);
                        opacity: 0.3;
                    }
                </style>
                <style id="custom-icons">
                    ${this.getCustomIconStyles()}
                </style>
                <ul id="directory"></ul>
                <div id="status"></div>
        `;
    }
    registerDom(){
        this.dom = {
            directory: this.shadow.querySelector("#directory"),
            status: this.shadow.querySelector("#status"),
            iconStyles: this.shadow.querySelector("#custom-icons")
        };
    }
    attachEvents(){
        this.addEventListener("pointerdown", this.onPointerDown);
        this.addEventListener("pointerup", this.onPointerUp);
        this.addEventListener("pointermover", this.onPointerMove);
        this.addEventListener("pointercancel", this.onPointerCancel);
    }
    onPointerDown(e){
        if(e.button !== 0){
            return;
        }
        this.#isDragging = true;
        this.setPointerCapture(e.pointerId);
        this.addEventListener("pointermove", this.onPointerMove);

        const dragBox = document.createElement("div");
        dragBox.classList.add("drag-box");

        this.dom.dragBox = dragBox;
        this.shadow.appendChild(dragBox);

        this.#dragStart = [e.pageX, e.pageY];

        //we need to default the whole thing in case move doesn't fire.
        //const containerRect = this.getBoundingClientRect();
        this.dom.dragBox.style.left = `${e.pageX}px`;
        this.dom.dragBox.style.top = `${e.pageY}px`;
        this.dom.dragBox.style.right = `${document.documentElement.scrollWidth - e.pageX}px`;
        this.dom.dragBox.style.bottom = `${document.documentElement.scrollHeight - e.pageY}px`;

        // Cache all element rects at drag start for drag performance
        this.#cachedRects.clear();
        for (const li of this.#domMap.keys()) {
            this.#cachedRects.set(li, getDocumentRect(li));
        }
    }
    onPointerCancel(e){
        e.releasePointerCapture(e.pointerId);
        this.#dragStart = null;
        this.#isDragging = false;
        this.dom.dragBox.parentNode.removeChild(this.dom.dragBox);
        this.#domMap.keys().forEach(e => e.classList.remove("selecting"));
        this.removeEventListener("pointermove", this.onPointerMove);
    }
    onPointerMove(e){
        const top = Math.min(this.#dragStart[1], e.pageY);
        const left = Math.min(this.#dragStart[0], e.pageX);
        const bottom = Math.max(this.#dragStart[1], e.pageY);
        const right = Math.max(this.#dragStart[0], e.pageX);


        this.dom.dragBox.style.left = `${left}px`;
        this.dom.dragBox.style.top = `${top}px`;
        this.dom.dragBox.style.right = `${document.documentElement.scrollWidth - right}px`;
        this.dom.dragBox.style.bottom = `${document.documentElement.scrollHeight - bottom}px`;

        const dragBoxRect = getDocumentRect(this.dom.dragBox);
        const intersectedElements = this.#domMap.keys().filter(li => checkAABB(this.#cachedRects.get(li), dragBoxRect)).toArray();

        this.#domMap.keys().forEach(e => e.classList.remove("selecting"));
        intersectedElements.forEach(e => e.classList.add("selecting"));
    }
    onPointerUp(e){
        if(e.button !== 0){
            return;
        }

        this.#isDragging = false;
        this.#dragStart = null;
        this.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this.onPointerMove);
        this.#domMap.keys().forEach(e => e.classList.remove("selecting"));

        const dragBoxRect = getDocumentRect(this.dom.dragBox);
        const intersectedElements = this.#domMap.keys().filter(li => checkAABB(getDocumentRect(li), dragBoxRect)).toArray();
        const thisEl = this.#domMap.keys().filter(li => checkPointInside({ x: dragBoxRect.right, y: dragBoxRect.bottom }, this.#cachedRects.get(li))).toArray()[0];

        if(e.shiftKey){
            const lastEl = this.#lastClicked ?? this.#elementArray[0];
            
            if(!lastEl || !thisEl) return;

            const lastIndex = this.#domMap.get(lastEl).index;
            const thisIndex = this.#domMap.get(thisEl).index;
            const topIndex = Math.min(lastIndex, thisIndex);
            const bottomIndex = Math.max(lastIndex, thisIndex);

            this.clearSelections();
            this.#elementArray.slice(topIndex, bottomIndex + 1)
                .forEach(e => {
                    const entry = this.#domMap.get(e).entry;
                    this.#selectedEntries.add(entry);
                    e.classList.add("selected");
                });
        } else {
            if(!e.ctrlKey){
                this.clearSelections();
            }

            intersectedElements.forEach(e => {
                const entry = this.#domMap.get(e).entry;
                if(this.#selectedEntries.has(entry)){
                    this.#selectedEntries.delete(entry);
                    e.classList.remove("selected");
                } else {
                    this.#selectedEntries.add(entry);
                    e.classList.add("selected");
                }
            });
        }

        this.dom.dragBox.parentNode.removeChild(this.dom.dragBox);
        this.#lastClicked = thisEl;
        this.onEntriesSelected();
    }
    clearSelections(){
        this.#selectedEntries.clear();
        this.#domMap.keys().forEach(li => li.classList.remove("selected"));
    }
    onEntriesSelected(){
        const event = new CustomEvent("entries-selected", {
            detail: { entries: [...this.#selectedEntries] }
        });
        this.dispatchEvent(event);
    }
    async show(directoryHandle){
        this.#selectedEntries.clear();
        this.#entryMap.clear();
        this.#domMap.clear();
        this.#elementArray = [];
        this.dom.status.textContent = "";
        this.#directoryHandle = directoryHandle;

        try {
            this.dom.directory.innerHTML = "";
            const entries = await directoryHandle.values();
            let index = 0;
            const customTypes = Object.keys(this.#iconMap).map(k => [k,k]);
            for await(const entry of entries){
                const li = document.createElement("li");
                if(entry.kind === "directory"){
                    li.classList.add("directory")
                }
                const ext = entry.name.split(".").at(-1);
                const type = classifyFileType(ext, customTypes);
                li.classList.add(type);
                
                const btn = document.createElement("button");
                btn.textContent = entry.name;
                li.appendChild(btn);
                this.dom.directory.appendChild(li);

                this.#entryMap.set(entry, li);
                this.#domMap.set(li, { entry, index });
                this.#elementArray[index] = li;
                index++;
            }
        } catch(e){
            this.dom.status.textContent = `Error: ${e}`;
        }
    }
    getCustomIconStyles(){
        const rules = Object.entries(this.#iconMap).map(([key, value]) => `li.${key} button::before { content: "${value}"; }` );
        return rules.join("\n");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    set ["icon-map"](val){
        if(typeof val == "string"){
            this.#iconMap = parseTextMap(val);
        } else {
            this.#iconMap = val;
        }
        if(!this.dom) return;
        if(this.dom?.iconStyles){
            this.dom.iconStyles.parentNode.removeChild(this.dom.iconStyles);
        }
        this.dom.iconStyles = document.createElement("style");
        this.dom.iconStyles.innerText = this.getCustomIconStyles();
    }
    get selectedEntries(){
        return [...this.#selectedEntries];
    }
}

customElements.define("wc-directory-listing", WcDirectoryListing);