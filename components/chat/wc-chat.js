import systemCss from "../../css/system.css" with { type: "css" };
import { createElement } from "../../libs/dom-utils.js";
import chatCss from "./wc-chat.css" with { type: "css" };

export class WcChat extends HTMLElement {
	static observedAttributes = [];

	#messages = [];

	connectedCallback() {
		this.bind();
		this.renderDom();
		this.registerDom();
		this.attachEvents();
	}
	bind() {
		this.addUserMessage = this.addUserMessage.bind(this);
	}
	renderDom() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.adoptedStyleSheets = [systemCss, chatCss];
		this.shadow.innerHTML = `
                <ul id="chat-list"></ul>
                <form id="chat-form" class="row gap2">
                    <input id="chat-input" type="text">
                    <button type="submit" id="chat-send">Send</button>
                </form>
        `;
	}
	registerDom() {
		this.dom = {
			chatList: this.shadow.querySelector("#chat-list"),
			chatForm: this.shadow.querySelector("#chat-form"),
			chatInput: this.shadow.querySelector("#chat-input"),
			chatSend: this.shadow.querySelector("#chat-send"),
		};
	}
	attachEvents() {
		this.dom.chatForm.addEventListener("submit", this.addUserMessage);
	}
	addUserMessage(e) {
		e.preventDefault();
		const text = this.dom.chatInput.value;
		this.#messages.push({
			text,
			time: Temporal.Now.plainDateTimeISO(),
			attachments: [],
			from: "user"
		});
		this.dom.chatInput.value = "";
		this.dom.chatList.append(createElement("li", { children: text, attrs: { class: "chat-message user"} }));
		this.dom.chatList.scrollTop = this.dom.chatList.scrollHeight;
	}
	addRemoteMessage(text, from) {
		this.#messages.push({
			text,
			time: Temporal.Now.plainDateTimeISO(),
			attachments: [],
			from
		});
		this.dom.chatList.append(createElement("li", { children: text, attrs: { class: "chat-message remote"} }));
		this.dom.chatList.scrollTop = this.dom.chatList.scrollHeight;
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this[name] = newValue;
		}
	}
}

customElements.define("wc-chat", WcChat);
