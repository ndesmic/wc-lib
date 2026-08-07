export class DomElement {
	#tag;
	#attributes = new Map();
	#children = [];

	constructor(tag) {
		this.#tag = tag;
	}

	setAttribute(attributeName, value) {
		this.#attributes.set(attributeName, value);
	}
	getAttribute(attributeName) {
		this.#attributes.get(attributeName);
	}
	appendChild(childEl) {
		this.#children.push(childEl);
	}
	get children() {
		return this.#children;
	}
	toString() {
		const tagPart = `<${this.#tag}`;
		const attrPart = this.#attributes.entries().map(([k, v]) => `${k}="${v}"`)
			.toArray().join(" ");
		const openingPart = `${tagPart}${attrPart ? ` ${attrPart}` : ""}>`;
		const endPart = `</${this.#tag}>`;
		return `${openingPart}${this.#children.map((c) => c.toString()).join("\n")}${endPart}`;
	}
}

export class Dom {
	static createElement(tag) {
		return new DomElement(tag);
	}
}
