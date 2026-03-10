import { getEventRelativeTo } from "../../libs/dom-utils.js";

export class WcRectangleInput extends HTMLElement {
    #top = 0;
    #left = 0;
    #right = 0;
    #bottom = 0;

    #handleIsDragging = new Set();
    #pointerToHandle = new Map();

    static observedAttributes = ["top", "left", "right", "bottom"];

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onHandlePointerDown = this.onHandlePointerDown.bind(this);
        this.onHandlePointerMove = this.onHandlePointerMove.bind(this);
        this.onHandlePointerUp = this.onHandlePointerUp.bind(this);
        this.onHandlePointerCancel = this.onHandlePointerCancel.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
                <style>
                    :host {
                        display: block;
                        position: absolute !important;
                        border: 1px solid black;
                        left: 0px;
                        top: 0px;
                        width: 100%;
                        height: 100%;
                    }
                    .rect { 
                        display: block;
                        position: absolute;
                        border: 1px solid var(--primary-color);
                        left: calc(var(--left) * 1px);
                        top: calc(var(--top) * 1px);
                        width: calc((var(--right) - var(--left)) * 1px);
                        height: calc((var(--bottom) - var(--top)) * 1px);
                    }
                    .handle {
                        display: block;
                        position: absolute;
                        width: 16px;
                        height: 16px;
                        border-radius: 16px;
                        border-width: 0px;
                        background: var(--primary-color);
                    }
                    .left {
                        left: -8px;
                    }
                    .right {
                        right: -8px;
                    }
                    .top { 
                        top: -8px;
                    }
                    .bottom {
                        bottom: -8px;
                    }
                    .v-mid {
                        top: calc(50% - 8px);
                    }
                    .h-mid {
                        left: calc(50% - 8px);
                    }
                    [data-position="left"], [data-position="right"] {
                        cursor: ew-resize;
                    }
                    [data-position="top"], [data-position="bottom"] {
                        cursor: ns-resize;
                    }
                    [data-position="top-left"], [data-position="bottom-right"] {
                        cursor: nwse-resize;
                    }
                    [data-position="bottom-left"], [data-position="top-right"] {
                        cursor: nesw-resize;
                    }
                    [data-position="center"] {
                        cursor: move;
                    }
                </style>
                <div class="rect">
                    <button class="top left handle" data-position="top-left"></button>
                    <button class="top h-mid handle" data-position="top"></button>
                    <button class="top right handle" data-position="top-right"></button>
                    <button class="left v-mid handle" data-position="left"></button>
                    <button class="right v-mid handle" data-position="right"></button>
                    <button class="bottom left handle" data-position="bottom-left"></button>
                    <button class="bottom h-mid handle" data-position="bottom"></button>
                    <button class="bottom right handle" data-position="bottom-right"></button>
                    <button class="v-mid h-mid handle" data-position="center"></button>
                </div>
        `;
    }
    registerDom(){
        this.dom = {
            handles: Array.from(this.shadowRoot.querySelectorAll(".handle"))
        };
    }
    attachEvents(){
        this.dom.handles.forEach(handle => handle.addEventListener("pointerdown", this.onHandlePointerDown));
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }

    onHandlePointerDown(e){
        this.#handleIsDragging.add(e.target);
        this.#pointerToHandle.set(e.pointerId, e.target);
        this.setPointerCapture(e.pointerId);
        this.addEventListener("pointermove", this.onHandlePointerMove);
        this.addEventListener("pointerup", this.onHandlePointerUp);
    }

    onHandlePointerMove(e){
        const { x, y } = getEventRelativeTo(this, e);
        const element = this.#pointerToHandle.get(e.pointerId);

        switch(element.dataset["position"]){
            case "top": {
                this.top = y;
                break;
            }
            case "bottom": {
                this.bottom = y;
                break;
            }
            case "left": {
                this.left = x;
                break;
            }
            case "right": {
                this.right = x;
                break;
            }
            case "top-left": {
                this.left = x;
                this.top = y;
                break;
            }
            case "top-right": {
                this.right = x;
                this.top = y;
                break;
            }
            case "bottom-left": {
                this.left = x;
                this.bottom = y;
                break;
            }
            case "bottom-right": {
                this.right = x;
                this.bottom = y;
                break;
            }
            case "center": {
                const halfWidth = (this.right - this.left) / 2;
                const halfHeight = (this.bottom - this.top) / 2;
                this.top = y - halfHeight;
                this.left = x - halfWidth;
                this.right =  x + halfWidth;
                this.bottom = y + halfHeight;
                break;
            }
        }
    }

    onHandlePointerUp(e){
        this.#handleIsDragging.delete(e.target);
        this.#pointerToHandle.delete(e.pointerId);
        this.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this.onHandlePointerMove);
        this.removeEventListener("pointerup", this.onHandlePointerUp);
        const event = new CustomEvent("rectangle-input", {
            bubbles: true,
            composed: true,
            detail: { 
                value: this.value
            }
        });
        this.dispatchEvent(event);
    }

    onHandlePointerCancel(e){
        e.releasePointerCapture(e.pointerId);
        this.#handleIsDragging.delete(e.target);
        this.#pointerToHandle.delete(e.pointerId);
    }

    get left(){
        return this.#left;
    }
    set left(value){
        this.style.setProperty("--left", value);
        this.#left = value;
    }
    get top(){
        return this.#top;
    }
    set top(value){
        this.style.setProperty("--top", value);
        this.#top = value;
    }
    get right(){
        return this.#right;
    }
    set right(value){
        this.style.setProperty("--right", value);
        this.#right = value; 
    }
    get bottom(){
        return this.#bottom;
    }
    set bottom(value){
        this.style.setProperty("--bottom", value);
        this.#bottom = value; 
    }

    get value(){
        return {
            top: this.#top,
            bottom: this.#bottom,
            left: this.#left,
            right: this.#right,
        };
    }
}

customElements.define("wc-rectangle-input", WcRectangleInput);