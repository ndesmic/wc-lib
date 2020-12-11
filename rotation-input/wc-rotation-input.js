function fireEvent(element, eventName, data, bubbles = true, cancelable = true) {
    const event = document.createEvent("HTMLEvents");
    event.initEvent(eventName, bubbles, cancelable);
    if (data) {
        event.data = data;
    }
    return element.dispatchEvent(event);
}

function validateEnum(val, choices){
    if(choices.includes(val)){
        return val;
    }
    throw new Error(`invalid type, only ${choices.join(",")} allowed.`);
}

function normalizeAngle(angle){
    if (angle < 0) {
        return 360 - (Math.abs(angle) % 360);
    }
    return angle % 360;
}

export class WcRotationInput extends HTMLElement {
    #isManipulating = false;
    #center = {};
    #precision = 2;
    #unit = "deg";
    #currentValue = 0;
    static #unitType = ["deg", "rad"];
    #trigger = "manipulate";
    static #triggerType = ["manipulate", "settled"];
    static observedAttributes = ["precision", "unit", "trigger"];
    constructor() {
        super();
        this.bind(this);
    }
    bind(element){
        this.render = this.render.bind(element);
        this.cacheDom = this.cacheDom.bind(element);
        this.attachEvents = this.attachEvents.bind(element);
        this.onPointerDown = this.onPointerDown.bind(element);
        this.onPointerMove = this.onPointerMove.bind(element);
        this.onPointerUp = this.onPointerUp.bind(element);
        this.onWheel = this.onWheel.bind(element);
    }
    render(){
        this.shadow = this.attachShadow({ mode: "open" });

        this.shadow.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    flex-flow: row nowrap;
                    gap: 0.5rem;
                    align-items: center;
                    width: 8rem;
                    height: 2rem;
                    --half-stroke: calc(var(--stroke-width, 1px) / 2);
                }
                svg {
                    width: auto;
                    height: 100%;
                }
                circle {
                    r : calc(50% - var(--half-stroke));
                    cx : 50%;
                    cy : 50%;
                    fill: var(--fill-color, #fff);
                    stroke-width: var(--stoke-width, 1px);
                    stroke: var(--stroke-color, #000);
                }
                #pointer {
                    stroke-width: var(--stoke-width, 1px);
                    stroke: var(--stroke-color, #000);
                    transform-origin: center center;
                }
                #value {
                    user-select: none;
                }
            </style>
            <svg viewBox="0 0 16 16">
                <circle />
                <line x1="50%" y1="50%" x2="100%" y2="50%" id="pointer"/>
            </svg>
            <div id="value"></div>
        `;
    }
    connectedCallback() {
        this.render();
        this.cacheDom();
        this.attachEvents();
    }
    cacheDom(){
        this.dom = {
            input: this.querySelector("input"),
            pointer: this.shadow.querySelector("#pointer"),
            value: this.shadow.querySelector("#value"),
            svg: this.shadow.querySelector("svg")
        };
    }
    attachEvents(){
        this.dom.svg.addEventListener("pointerdown", this.onPointerDown);
        this.addEventListener("wheel", this.onWheel);
    }
    onPointerDown(e){
        this.#isManipulating = true;
        const rect = this.dom.svg.getBoundingClientRect();
        this.#center = { x: rect.x + (rect.width / 2), y: rect.y + (rect.height / 2) };
        document.addEventListener("pointermove", this.onPointerMove);
        document.addEventListener("pointerup", this.onPointerUp);
    }
    onPointerMove(e){
        const offsetX = e.clientX - this.#center.x;
        const offsetY = this.#center.y - e.clientY;  //y-coords flipped
        let rad;
        if (offsetX >= 0 && offsetY >= 0){ rad = Math.atan(offsetY / offsetX); }
        else if (offsetX < 0 && offsetY >= 0) { rad = (Math.PI / 2) + Math.atan(-offsetX / offsetY); }
        else if (offsetX < 0 && offsetY < 0) { rad = Math.PI + Math.atan(offsetY / offsetX); }
        else { rad = (3 * Math.PI / 2) + Math.atan(offsetX / -offsetY); }
        const deg = (180 / Math.PI) * rad;
        const finalValue = (this.#unit === "rad" ? rad : deg).toFixed(this.#precision);
        this.dom.pointer.style = `transform: rotateZ(-${deg}deg)`;
        this.dom.value.textContent = finalValue;

        if(this.#trigger === "manipulate"){
            this.dom.input.value = finalValue;
            fireEvent(this.dom.input, "input");
            fireEvent(this.dom.input, "change");
        } else {
            this.#currentValue = finalValue;
        }
    }
    onPointerUp(){
        this.#isManipulating = false;
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
        if(this.#trigger === "settled"){
            this.dom.input.value = this.#currentValue;
            fireEvent(this.dom.input, "input");
            fireEvent(this.dom.input, "change");
        }
    }
    onWheel(e){
        const delta = e.deltaY * (15 / 100)
        const newValue = normalizeAngle(parseFloat(this.dom.input.value || 0) + delta);
        this.dom.value.textContent = newValue;
        this.dom.input.value = newValue;
        fireEvent(this.dom.input, "input");
        fireEvent(this.dom.input, "change");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }
    set precision(val){
        this.#precision = parseInt(val);
    }
    set unit(val) {
        this.#unit = validateEnum(val, WcRotationInput.#unitType);
    }
    set trigger(val) {
        this.#trigger = validateEnum(val, WcRotationInput.#triggerType);
    }
}

customElements.define("wc-rotation-input", WcRotationInput);
