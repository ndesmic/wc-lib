import { jsTokenizer } from "../../libs/parser/js/js-tokenizer.js";
import { jsTokensToDom } from "../../libs/parser/js/js-tokens-to-dom.js";
import { dedent, decodeHtml } from "../../libs/string-utils.js";

class WcCodeHighlighter extends HTMLElement {
	#value;

	static get observedAttributes() {
		return [];
	}
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.render = element.render.bind(element);
		element.attachEvents = element.attachEvents.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.highlightSyntax = element.highlightSyntax.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
				<style>
					:host { display: grid; }
					#output { grid-col: 1 / 2; background: #222; font-family: monaco, monospace; white-space: pre; }
					.identifier { color: lightblue; }
					.operator { color: white; }
					.string-literal { color: orange; }
					.keyword-1 { color: blue; }
					.keyword-2 { color: violet; }
					.grouping { color: yellow; }
					.number-literal { color: green; }
				</style>
				<div id="output"></div>
			`;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
		const hasValue = !!this.dom.innerTemplate.innerHTML.trim();
		this.#value = hasValue ? dedent(lineTrim(decodeHtml(this.dom.innerTemplate.innerHTML))) : "";
		this.highlightSyntax();
	}
	cacheDom() {
		this.dom = {
			output: this.shadowRoot.querySelector("#output"),
			innerTemplate: this.querySelector("template")
		};
	}
	attachEvents() {

	}
	highlightSyntax() {
		const tokens = jsTokenizer.getTokens(this.#value);
		this.dom.output.innerHTML = "";
		this.dom.output.appendChild(jsTokensToDom(tokens));
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
}

customElements.define("wc-code-highlighter", WcCodeHighlighter);