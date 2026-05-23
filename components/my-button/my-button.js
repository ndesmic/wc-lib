import {
	parsePlainDateTimeOrDefault,
	register,
	renderInnerHTML,
	renderOuterHTMLNoPropsShadowWithStyles,
} from "../../libs/wc-utils.js";

const HTMLElement = globalThis.HTMLElement ?? class {};

export class MyButton extends HTMLElement {
    #message = "Hello World!";
	#time = Temporal.Now.plainDateTimeISO();

	static name = "my-button";
	static styleSheets = ["../../css/system.css"];
    static observedAttributes = ["data-message", "data-time"];
	static render(props) {
		return renderOuterHTMLNoPropsShadowWithStyles(
			MyButton.name,
			import.meta.url,
			"open",
			props,
			this.styleSheets
		);
	}
	async connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			const componentUrlStem = import.meta.url.split(".").slice(0, -1).join(".");
			this.shadowRoot.setHTMLUnsafe(await renderInnerHTML(componentUrlStem, {}));
		}
		if (!this.shadowRoot.querySelector("link, style")) {
			for (const stylesheetUrl of MyButton.styleSheets) {
				const namespace = await import(/* @vite-ignore */stylesheetUrl, { with: { type: "css" } });
				const styleSheet = namespace.default;
				this.shadowRoot.adoptedStyleSheets.push(styleSheet);
			}
		}
		this.shadowRoot.querySelector("button").onclick = () => {
			alert(`${this.#message} @ ${this.#time.toString()}`);
		};
	}
    attributeChangedCallback(name, oldValue, newValue){
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    set ["data-message"](value){
        this.#message = value;
    }
    get ["data-message"](){
        return this.#message;
    }
	set ["data-time"](value){
		this.#time = parsePlainDateTimeOrDefault(value);
	}
	get ["data-time"](){
		return this.#time;
	}
}

register(MyButton);
