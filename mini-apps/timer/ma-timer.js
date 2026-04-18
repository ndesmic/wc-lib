import { Engine } from "../../libs/engine/engine.js";

export class MaTimer extends HTMLElement {
    #engine;

    constructor(){
        super();
        this.bind(this);
        this.#engine = new Engine({
            onRender: this.onRender
        });
    }
    connectedCallback(){
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onStart = this.onStart.bind(this);
        this.onStop = this.onStop.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.onRender = this.onRender.bind(this);
    }
    registerDom(){
        this.dom = {
            display: this.querySelector(".display"),
            toggleButton: this.querySelector(".toggle-button")
        };
    }
    attachEvents(){
        this.dom.toggleButton.addEventListener("click", this.onToggle);
    }
    onToggle(){
        if(this.#engine.isRunning){
            this.onStop();
        } else {
            this.onStart();
        }
    }
    onStart(){
        this.#engine.start(performance.now());
        this.dom.toggleButton.textContent = "Stop";
    }
    onStop(){
        this.#engine.stop();
        this.dom.toggleButton.textContent = "Start";
    }
    onRender(thisTimestamp, startTimestamp){
        const thisTimeNs = BigInt(Math.floor((performance.timeOrigin + thisTimestamp) * 1_000_000));
        const startTimeNs = BigInt(Math.floor((performance.timeOrigin + startTimestamp) * 1_000_000));
        const thisInstant = Temporal.Instant.fromEpochNanoseconds(thisTimeNs);
        const startInstant = Temporal.Instant.fromEpochNanoseconds(startTimeNs);
        const duration = startInstant.until(thisInstant);
        this.dom.display.textContent = `${duration.seconds.toString().padStart(2,0)}:${duration.milliseconds.toString().padStart(3,0)}`;
    }
}

customElements.define("ma-timer", MaTimer);