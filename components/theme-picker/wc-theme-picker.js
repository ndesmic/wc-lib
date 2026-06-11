import { register, renderInnerHTML, renderOuterHTMLNoPropsShadowWithStyles } from "../../libs/wc-utils.js";

const HTMLElement = globalThis.HTMLElement ?? class {};

export class WcThemePicker extends HTMLElement {
	static name = "wc-theme-picker";
	static styleSheets = ["/css/system.css", "./wc-theme-picker.css"];
	static observedAttributes = ["theme", "localstorage-key"];

	#theme;
	#key = "site-theme";
	#renderBase = import.meta.url.split("/").slice(0, -1).join("/") + "/";
	#cssBase = import.meta.url.split("/").slice(0, -1).join("/") + "/";

	async connectedCallback() {
		this.bind();
		await this.hydrate();
		this.registerDom();
		const computedTheme = this.#theme ?? getComputedStyle(document.documentElement).getPropertyValue("--theme");
		this.theme = computedTheme ? computedTheme : "auto"; //might be empty string if not found
		this.attachEvents();
	}
	bind() {
		this.onRadioChange = this.onRadioChange.bind(this);
	}
	async hydrate() {
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.shadowRoot.setHTMLUnsafe(await renderInnerHTML(this.#renderBase, WcThemePicker.name, {}));
		}
		if (!this.shadowRoot.querySelector("link, style")) {
			for (const stylesheetUrl of WcThemePicker.styleSheets) {
				const namespace = await import(/* @vite-ignore */ new URL(stylesheetUrl, this.#cssBase).toString(), { with: { type: "css" } });
				const styleSheet = namespace.default;
				console.log(styleSheet);
				this.shadowRoot.adoptedStyleSheets.push(styleSheet);
			}
		}
	}
	static render(renderBase, cssBase, props) {
		return renderOuterHTMLNoPropsShadowWithStyles(
			renderBase,
			cssBase,
			WcThemePicker.name,
			"open",
			props,
			WcThemePicker.styleSheets,
		);
	}
	registerDom() {
		this.dom = {
			radios: Array.from(this.shadowRoot.querySelectorAll("#theme-popover button")),
			button: this.shadowRoot.querySelector("#theme-popover-button"),
		};
	}
	attachEvents() {
		this.dom.radios.map((r) => r.addEventListener("click", this.onRadioChange));
	}
	onRadioChange(e) {
		this.theme = e.currentTarget.value;
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
	set theme(value) {
		this.#theme = value;
		document.documentElement.style.setProperty("--theme", value);
		localStorage.setItem(this.#key, value);
		let selectedButton;
		for (const radio of this.dom.radios) {
			if (radio.value === value) {
				radio.setAttribute("aria-checked", "true");
				selectedButton = radio;
			} else {
				radio.setAttribute("aria-checked", "false");
			}
		}
		this.dom.button.setHTMLUnsafe(selectedButton.innerHTML);
		this.dom.button.classList.remove("indeterminant");
	}
	get theme() {
		return this.#theme;
	}
	set ["localstorage-key"](value) {
		this.#key = value;
	}
}

register(WcThemePicker);
