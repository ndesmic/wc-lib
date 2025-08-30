import { Tokenizer } from "./tokenizer.js";
import { jsTokensToDom } from "./js-tokens-to-dom.js";

const tokenizer = new Tokenizer([
	{ matcher: "\n", type: "newline" },
	{ matcher: "\t", type: "tab" },
	{ matcher: /^\s+/, type: "generic-whitespace" },
	{ matcher: /^[\"\'](.*?)[\"\']/, type: "string-literal" },
	{ matcher: "break", type: "keyword:break" },
	{ matcher: "case", type: "keyword:case" },
	{ matcher: "catch", type: "keyword:catch" },
	{ matcher: "class", type: "keyword:class" },
	{ matcher: "const", type: "keyword:const" },
	{ matcher: "continue", type: "keyword:continue" },
	{ matcher: "debugger", type: "keyword:debugger" },
	{ matcher: "default", type: "keyword:default" },
	{ matcher: "delete", type: "keyword:delete" },
	{ matcher: "do", type: "keyword:do" },
	{ matcher: "else", type: "keyword:else" },
	{ matcher: "export", type: "keyword:export" },
	{ matcher: "extends", type: "keyword:extends" },
	{ matcher: "finally", type: "keyword:finally" },
	{ matcher: "for", type: "keyword:for" },
	{ matcher: "from", type: "keyword:from" },
	{ matcher: "function", type: "keyword:function" },
	{ matcher: "if", type: "keyword:if" },
	{ matcher: "import", type: "keyword:import" },
	{ matcher: "in", type: "keyword:in" },
	{ matcher: "instanceof", type: "keyword:instanceof" },
	{ matcher: "let", type: "keyword:let" },
	{ matcher: "new", type: "keyword:new" },
	{ matcher: "return", type: "keyword:return" },
	{ matcher: "super", type: "keyword:super" },
	{ matcher: "switch", type: "keyword:switch" },
	{ matcher: "this", type: "keyword:this" },
	{ matcher: "throw", type: "keyword:throw" },
	{ matcher: "try", type: "keyword:try" },
	{ matcher: "typeof", type: "keyword:typeof" },
	{ matcher: "var", type: "keyword:var" },
	{ matcher: "void", type: "keyword:void" },
	{ matcher: "while", type: "keyword:while" },
	{ matcher: "with", type: "keyword:with" },
	{ matcher: "yield", type: "keyword:yield" },
	{ matcher: ",", type: "comma" },
	{ matcher: ";", type: "semicolon" },
	{ matcher: "{", type: "open-curly" },
	{ matcher: "}", type: "close-curly" },
	{ matcher: "[", type: "open-square" },
	{ matcher: "]", type: "close-square" },
	{ matcher: "(", type: "open-paren" },
	{ matcher: ")", type: "close-paren" },
	{ matcher: "+", type: "plus" },
	{ matcher: "-", type: "minus" },
	{ matcher: "*", type: "multiply" },
	{ matcher: "/", type: "divide" },
	{ matcher: "++", type: "increment" },
	{ matcher: "--", type: "decrement" },
	{ matcher: "**", type: "exponent" },
	{ matcher: "=", type: "equal-assign" },
	{ matcher: "==", type: "equal-compare" },
	{ matcher: "===", type: "equal-compare-strict" },
	{ matcher: "<", type: "less-than" },
	{ matcher: "<=", type: "less-than-equal" },
	{ matcher: ">", type: "greater-than-equal" },
	{ matcher: ">=", type: "greater-than-equal" },
	{ matcher: "\"", type: "double-quote" },
	{ matcher: "\'", type: "single-quote" },
	{ matcher: "`", type: "backtick" },
	{ matcher: ".", type: "dot" },
	{ matcher: /^[0-9]\.?[0-9]?/, type: "number-literal" },
	{ matcher: /^[a-zA-Z]+/, type: "identifier" }
]);

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
		const tokens = tokenizer.getTokens(this.#value);
		this.dom.output.innerHTML = "";
		this.dom.output.appendChild(jsTokensToDom(tokens));
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = newValue;
	}
}

customElements.define("wc-code-highlighter", WcCodeHighlighter);