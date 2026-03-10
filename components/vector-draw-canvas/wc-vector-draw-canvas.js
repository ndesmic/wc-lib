import { createSvg } from "../../libs/dom-utils.js";
import vectorDrawCanvasCss from "./wc-vector-draw-canvas.css" with { type: "css" };

export class WcVectorDrawCanvas extends HTMLElement {
    #startPoint;
    #height = 480;
    #width = 640;

    static observedAttributes = ["height", "width"]

    connectedCallback(){
        this.bind(this);
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onPointerCancel = this.onPointerCancel.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.adoptedStyleSheets = [vectorDrawCanvasCss];
        this.shadow.innerHTML = `
                <svg id="canvas" height="${this.#height}" width="${this.#width}"></svg>
        `;
    }
    registerDom(){
        this.dom = {
            canvas: this.shadow.querySelector("#canvas"),
        };
    }
    attachEvents(){
        this.dom.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.dom.canvas.addEventListener("pointerup", this.onPointerUp);
        this.dom.canvas.addEventListener("pointercancel", this.onPointerCancel);
    }
    onPointerDown(e){
        this.#startPoint = [e.offsetX, e.offsetY];
        this.dom.canvas.setPointerCapture(e.pointerId);
        this.addEventListener("pointermove", this.onPointerMove);
    }
    onPointerMove(e){
        const segment = createSvg("line", {
            attrs: {
                x1: this.#startPoint[0],
                y1: this.#startPoint[1],
                x2: e.offsetX,
                y2: e.offsetY,
                stroke: "#000",
                "stroke-width": 1
            }
        });
        this.dom.canvas.append(segment);
        this.#startPoint = [e.offsetX, e.offsetY];
    }
    onPointerUp(e){
        this.dom.canvas.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this.onPointerMove);
    }
    onPointerCancel(e){
        this.dom.canvas.releasePointerCapture(e.pointerId);
        this.removeEventListener("pointermove", this.onPointerMove);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    get width(){
        return this.#width;
    }
    set width(value){
        this.#width = parseFloat(value);
        if(this.dom?.canvas){
            this.dom.canvas.width = this.#width;
        }
    }
    get height(){
        return this.#height;
    }
    set height(value){
        this.#height = parseFloat(value);
        if(this.dom?.height){
            this.dom.canvas.height = this.#height;
        }
    }
}

customElements.define("wc-vector-draw-canvas", WcVectorDrawCanvas);