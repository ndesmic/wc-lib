import { createElement } from "../../libs/dom-utils.js";
import systemCss from "../../css/system.css" with { type: "css" };

function argsToString(args) {
	return args.map(arg => arg.toString()).join(", ");
}

export class WcDomConsole extends HTMLElement {
	static observedAttributes = [];

	#originalConsoleObject;

	connectedCallback() {
		this.bind();
		this.init();
		this.renderDom();
		this.registerDom();
	}
	disconnectedCallback() {
		globalThis.console = this.#originalConsoleObject;
	}
	init() {
		this.#originalConsoleObject = globalThis.console;
		const webConsole = this;
		globalThis.console = new Proxy(console, {
			get(target, prop, receiver) {
				const originalMethod = target[prop];
				return (...args) => {
					originalMethod(...args);
					webConsole[prop](...args);
				}
			}
		});
	}
	bind() {}
	renderDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.adoptedStyleSheets = [systemCss];
		this.shadow.innerHTML = `
        	<ul id="messages"><ul>
        `;
	}
	registerDom() {
		this.dom = {
			messages: this.shadow.querySelector("#messages")
		};
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
	log(...args) {
		this.dom.messages.append(createElement("li", { attrs: { class: "neutral" }, children: argsToString(args) }));
	}
	warn(...args) {
		this.dom.messages.append(createElement("li", { attrs: { class: "warn" }, children: argsToString(args) }));
	}
	error(...args) {
		this.dom.messages.append(createElement("li", { attrs: { class: "error" }, children: argsToString(args) }))
	}
}

customElements.define("wc-dom-console", WcDomConsole);
