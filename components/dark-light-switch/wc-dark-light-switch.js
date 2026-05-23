import systemCss from "../../css/system.css" with { type: "css" };
import darkLightSwitchCss from "./wc-dark-light-switch.css" with { type: "css" };

export class WcDarkLightSwitch extends HTMLElement {
    static observedAttributes = [];

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onRadioChange = this.onRadioChange.bind(this);
    }
    renderDom(){
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [systemCss, darkLightSwitchCss];
        this.shadowRoot.innerHTML = `
            <button id="theme-popover-button" popovertarget="theme-popover">Theme</button>
            <div popover id="theme-popover" anchor="theme-popover-button" class="tail-top">
                <fieldset>
                    <legend class="visually-hidden">Theme</legend>
                    <label class="row align-center">
                        <input class="visually-hidden" type="radio" name="theme" value="auto">
                        <span class="row gap2">
                            <svg height="16" width="16">
                                <path d="
                                    M0 0 H8 V16 H0 Z
                                    M8 0
                                    A8 8 0 1 0 8 16
                                    A8 8 0 1 0 8 0 Z
                                " fill="currentColor" fill-rule="evenodd"/>

                                <path d="
                                    M8 0
                                    A8 8 0 0 1 16 8
                                    A8 8 0 0 1 8 16
                                    Z
                                " fill="currentColor"/>
                            </svg>
                            <span>Auto</span>
                        <span>
                    </label>
                    <label class="row align-center">
                        <input class="visually-hidden" type="radio" name="theme" value="light">
                        <span class="row gap2">
                            <svg height="16" width="16"><circle r="8" cx="8" cy="8" fill="none" stroke-width="4" stroke="currentColor"  /></svg>
                            <span>Light</span>
                        </span>
                    </label>
                    <label class="row align-center">
                        <input class="visually-hidden" type="radio" name="theme" value="dark">
                        <span class="row gap2">
                            <svg height="16" width="16"><circle r="8" cx="8" cy="8" /></svg>
                            <span>Dark</span>
                        </span>
                    </label>
                </fieldset>
            </div>
        `;
    }
    registerDom(){
        this.dom = {
            radios: Array.from(this.shadowRoot.querySelectorAll("input"))
        };
    }
    attachEvents(){
        this.dom.radios.map(r => r.addEventListener("change", this.onRadioChange))
    }
    onRadioChange(e){
        if(e.target.checked){
            //document.documentElement.dataset.theme = e.target.value;
            document.documentElement.style.setProperty("--theme", e.target.value);
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
}

customElements.define("wc-dark-light-switch", WcDarkLightSwitch);
