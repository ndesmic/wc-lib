class WcSpoiler extends HTMLElement {
	#isShown = false;
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
	}

	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
	}

	render() {
		this.attachShadow({ mode: "open" });
		const label = this.getAttribute("label")
			? this.getAttribute("label")
			: "Toggle to read spoiler";

		this.shadowRoot.innerHTML = `
			<style>
			:host { position: relative; display: inline-block; }
			#label-button {
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0px;
				left: 0px;
				background-color: black;
				border: none;
			}
			#label-button[aria-pressed="true"] {
				background-color: transparent;
			}
			#button-text, #live-area {
				clip: rect(0 0 0 0);
				height: 0px;
				width: 0px;
				padding: 0px;
				margin: 0px;
				overflow: hidden;
			}
			</style>
			<slot aria-hidden="true"></slot>
			<div id="live-area" aria-live="polite"></div>
			<button id="label-button" aria-role="switch"><div id="button-text">${label}</div></button>
			`;
	}
	cacheDom() {
		this.dom = {
			labelButton: this.shadowRoot.querySelector("#label-button"),
			buttonText: this.shadowRoot.querySelector("#button-text"),
			liveArea: this.shadowRoot.querySelector("#live-area"),
			slot: this.shadowRoot.querySelector("slot")
		};
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
	attachEvents() {
		this.dom.labelButton.addEventListener("click", () => {
			this.#isShown = !this.#isShown;
			this.dom.slot.ariaHidden = this.#isShown ? "false" : "true";
			this.dom.labelButton.ariaPressed = this.#isShown ? "true" : "false";
			this.dom.liveArea.textContent = this.#isShown ? this.textContent : "";
		});
	}
	set label(val) {
		if (this.dom?.buttonText && val.trim()) {
			this.dom.buttonText = val;
		}
	}
}

customElements.define("wc-spoiler", WcSpoiler);