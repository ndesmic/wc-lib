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

const TWO_PI = Math.PI * 2;
function normalizeAngle(angle){
    if (angle < 0) {
        return TWO_PI - (Math.abs(angle) % TWO_PI);
    }
    return angle % TWO_PI;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad * (180 / Math.PI);
}

function getSteps(step, end, start = 0) {
    const steps = [start];
    let current = start + step;
    while (current < end) {
        steps.push(current);
        current += step;
    }
    steps.push(end);
    return steps;
}

export function getClosest(value, possibleValues) {
    let highIndex = possibleValues.length;
    let lowIndex = 0;
    let midIndex;

    while (lowIndex < highIndex) {
        midIndex = Math.floor((highIndex + lowIndex) / 2);
        if (value === possibleValues[midIndex]) return possibleValues[midIndex];
        if (value < possibleValues[midIndex]) {
            if (midIndex > 0 && value > possibleValues[midIndex - 1]) {
                return value - possibleValues[midIndex + 1] >= possibleValues[midIndex] - value
                    ? possibleValues[midIndex]
                    : possibleValues[midIndex - 1]
            }
            highIndex = midIndex;
        }
        else {
            if (midIndex < highIndex - 1 && value < possibleValues[midIndex + 1]) {
                return value - possibleValues[midIndex] >= possibleValues[midIndex + 1] - value
                    ? possibleValues[midIndex + 1]
                    : possibleValues[midIndex]
            }
            lowIndex = midIndex + 1;
        }
    }
    return possibleValues[midIndex]
}

export class WcRotationInput extends HTMLElement {
    #center = {};
    #precision = 2;
    #unit = "deg";
    #currentValue = 0;
    static #unitType = ["deg", "rad"];
    #trigger = "manipulate";
    #stepAmount = 1;
    #steps = null;
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
        this.onInputChange = this.onInputChange.bind(element);
        this.updateSteps = this.updateSteps.bind(element);
        this.onKeydown = this.onKeydown.bind(element);
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
        if(this.tabIndex <= 0){
            this.tabIndex = 0;
        }
        this.setAttribute("aria-role", "slider");
    }
    connectedCallback() {
        this.render();
        this.cacheDom();
        this.attachEvents();
        this.updateSteps();
        this.updateValue(this.parse(this.dom.input.value) || 0);
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
        this.addEventListener("keydown", this.onKeydown);
        this.mutationObserver = new MutationObserver(this.onInputChange);
        this.mutationObserver.observe(this.dom.input, { attributes: true });
    }
    onInputChange(mutationList){
        for(const mutation of mutationList){
            if(mutation.attributeName === "step"){
                this.updateSteps();
            }
        }
    }
    updateSteps(){
        if(!this.dom.input.hasAttribute(step)){
            this.#steps = null;
            this.#stepAmount = 1;
        }
        this.#stepAmount = parseFloat(this.dom.input.getAttribute("step") || 1);
        const stepsAmountRad = this.#unit === "rad" ? this.#stepAmount : degreesToRadians(this.#stepAmount);
        this.#steps = getSteps(stepsAmountRad, TWO_PI);
    }
    onPointerDown(e){
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
        
        rad = this.#steps === null ? rad : getClosest(rad, this.#steps);

        const deg = radiansToDegrees(rad);
        const finalValue = (this.#unit === "rad" ? rad : deg).toFixed(this.#precision);
        this.dom.pointer.style = `transform: rotateZ(-${deg}deg)`;
        this.dom.value.textContent = finalValue;

        if(this.#trigger === "manipulate"){
            this.updateValue(rad);
        } else {
            this.#currentValue = rad;
        }
    }
    updateValue(valueRad){
        const finalValue = (this.#unit === "rad" ? valueRad : radiansToDegrees(valueRad)).toFixed(this.#precision);
        const valueDeg  = radiansToDegrees(valueRad);
        this.dom.input.value = finalValue;
        this.dom.value.textContent = finalValue;
        this.dom.pointer.style = `transform: rotateZ(-${valueDeg}deg)`;
        fireEvent(this.dom.input, "input");
        fireEvent(this.dom.input, "change");
        this.setAttribute("aria-valuenow", finalValue);
        this.setAttribute("aria-valuetext", finalValue);
    }
    onPointerUp(){
        document.removeEventListener("pointermove", this.onPointerMove);
        document.removeEventListener("pointerup", this.onPointerUp);
        if(this.#trigger === "settled"){
            this.updateValue(this.#currentValue);
        }
    }
    onWheel(e){
        const delta = e.deltaY * (this.#unit === "rad" ? this.#stepAmount : degreesToRadians(this.#stepAmount)) / 100;
        const newValue = normalizeAngle(this.parse(this.dom.input.value || 0) + delta);
        this.updateValue(newValue);
    }
    onKeydown(e){
        if(e.which !== 38 && e.which !== 40) return;
        const delta = (this.#unit === "rad" ? this.#stepAmount : degreesToRadians(this.#stepAmount)) * (e.which === 40 ? -1 : 1);
        const newValue = normalizeAngle(this.parse(this.dom.input.value || 0) + delta);
        this.updateValue(newValue)
    }
    parse(unparsedValue){
        const value = parseFloat(unparsedValue);
        return this.#unit === "rad" ? value : degreesToRadians(value);
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
