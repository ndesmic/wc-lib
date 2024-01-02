class WcTree extends HTMLElement {
	static observedAttributes = ["root"];
	#state = {};

	constructor(){
		super();
	}

	connectedCallback() {
		this.render();
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		this.#state[name] = newValue;
	}

	render(){
		if(!this.#state.root) return;
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
		}
		this.shadowRoot.innerHTML = "";
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		buildVirtualTree(this.#state.root);
		console.log(getTreeDepth(this.#state.root));

	}

	set root(val){
		this.#state.root = val;
		this.render();
	}
}

function getTreeDepth(root){
	if(!root) return 0;
	if(!root.nodes) return 1;
	return Math.max(...root.nodes.map(n => getTreeDepth(n))) + 1;
}

function buildVirtualTree(root){
	const depth = getTreeDepth(root);

	if(!root) return null;
	return {
		data: root.data,
		nodes: root.nodes?.map(n => buildVirtualTree(n))
	}
}

customElements.define("wc-tree", WcTree);