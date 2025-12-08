import { jsTokenizer } from "./js-tokenizer.js";
import { jsTokensToDom } from "./js-tokens-to-dom.js";

/**
 * Trims only lines from the text  
 * @param {string} text 
 * @returns 
 */
function lineTrim(text) {
	return text.replace(/^(\r?\n)+/us, "")
		.replace(/(\r?\n)+$/us, "")
}

/**
 * dedents the text based on first line
 * @param {string} text 
 */
function dedent(text) {
	const lines = text.split("\n");
	let char = lines[0].charAt(0);
	let count = 0;
	const spacingChar = char;
	if (!/[ \t]/.test(spacingChar)) {
		return text;
	}
	while (char === spacingChar) {
		count++;
		char = lines[0].charAt(count);
	}
	if (count === 0) {
		return text;
	}
	const regExp = new RegExp(`^${spacingChar}{${count}}`, "us");
	return lines.map(line => line.replace(regExp, "")).join("\n");
}

const htmlEntityRegExp = /(?=&)(.*?)(?<=;)/gus;
const htmlEntities = {
	"gt": ">",
	"lt": "<",
	"amp": "&",
	"nbsp": "\u00a0"
};
function decodeHtml(text) {
	return text.replace(htmlEntityRegExp, value => {
		const entity = value.replace(/^&/, "").replace(/;$/, "");
		const entityString = htmlEntities[entity];
		if (entityString) {
			return entityString;
		}
		throw new Error(`decodeHtml doesn't support ${entity}`);
	});
}

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