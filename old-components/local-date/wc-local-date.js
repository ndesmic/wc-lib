function asUTC(dateString){
    if (/\d\d\d\d-\d\d-\d\dT\d\d:\d\d$/.test(dateString)) {
        return `${dateString}:000Z`;
    }
    return dateString;
}

function hyphenCaseToCamelCase(text){
    return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export class WcLocalDate extends HTMLElement {
    #value = new Date();
    #displayValue = "";
    #dateStyle = "full";
    #timeStyle = "full";
    static observedAttributes = ["value", "date-style", "time-style"];
    constructor() {
        super();
        this.bind(this);
    }
    bind(element){
        this.render = this.render.bind(element)
    }
    render(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
            <div>${this.#displayValue}</div>
        `;
    }
    connectedCallback() {
        this.render();
        this.cacheDom();
    }
    cacheDom(){
        this.dom = {
            date: this.shadow.querySelector("div")
        };
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "value"){
            this.value = new Date(asUTC(newValue));
        } else {
            this[hyphenCaseToCamelCase(name)] = newValue;
        } 
    }
    setDisplayValue(){
        const options = {};
        if (this.#dateStyle) {
            options.dateStyle = this.#dateStyle;
        }
        if (this.#timeStyle) {
            options.timeStyle = this.#timeStyle
        }
        const formatter = new Intl.DateTimeFormat(undefined, options);
        this.#displayValue = formatter.format(this.#value);
        if(this.dom?.date){
            this.dom.date.textContent = this.#displayValue;
        }
    }
    get value(){
        return this.#value;
    }
    set value(val){
        this.#value = val;
        this.setDisplayValue();
    }
    set dateStyle(val){
        this.#dateStyle = val;
        this.setDisplayValue();
    }
    set timeStyle(val){
        this.#timeStyle = val;
        this.setDisplayValue();
    }
}

customElements.define("wc-local-date", WcLocalDate);
