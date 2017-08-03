customElements.define("tab-panel",
	class extends HTMLElement {
		static get observedAttributes(){
			return ["selected-index"];
		}
		constructor(){
			super();
			this.bind(this);
		}
		bind(element){
            element.createShadowDom = element.createShadowDom.bind(element);
			element.attachEvents = element.attachEvents.bind(element);
			element.cacheDom = element.cacheDom.bind(element);
            element.onTabClick = element.onTabClick.bind(element);
			element.selectTabByIndex = element.selectTabByIndex.bind(element);
		}
		connectedCallback(){
            this.createShadowDom();
			this.cacheDom();
			this.attachEvents();
            this.dom.tabs[this["selected-index"] || 0].classList.add("selected");
            this.dom.contents[this["selected-index"] || 0].classList.add("selected");
		}
        createShadowDom(){
            this.shadow = this.attachShadow({ mode: "closed" });
            this.shadow.innerHTML = `
                <style>
                    :host { display: block;}
                    .tabs { display: flex; flex-flow: row nowrap; }
                    .tabs ::slotted(*) { padding: 5px; border: 1px solid #ccc; -webkit-user-select: none; user-select: none; cursor: pointer; }
                    .tabs ::slotted(.selected) { background: #efefef; }
                    .tab-contents ::slotted(*) { display: none; }
                    .tab-contents ::slotted(.selected) { display: block; padding: 5px; }
                </style>
                <div class="tabs">
                    <slot id="tab-slot" name="tab"></slot>
                </div>
                <div class="tab-contents">
                    <slot id="content-slot" name="content"></slot>
                </div>
            `;
        }
		cacheDom(){
			this.dom = {};
            this.dom.tabSlot = this.shadow.querySelector("#tab-slot");
            this.dom.contentSlot = this.shadow.querySelector("#content-slot");
			this.dom.tabs = this.dom.tabSlot.assignedNodes({ flatten: true })
				.filter(n => n.nodeType === Node.ELEMENT_NODE);
			this.dom.contents = this.dom.contentSlot.assignedNodes({ flatten: true })
				.filter(n => n.nodeType === Node.ELEMENT_NODE);
		}
		attachEvents(){
            this.dom.tabSlot.addEventListener("click", this.onTabClick);
		}
        onTabClick(e){
            const target = e.target;
            if(target.slot === "tab"){
                const tabIndex = this.dom.tabs.indexOf(target);
				this.selectTabByIndex(tabIndex);
            }
        }
		selectTabByIndex(tabIndex){
			this.dom.tabs.forEach(e => e.classList.remove("selected"));
			this.dom.contents.forEach(e => e.classList.remove("selected"));
			this.dom.tabs[tabIndex].classList.add("selected");
			this.dom.contents[tabIndex].classList.add("selected");
		}
        getChildIndex(node){
            return Array.prototype.indexOf.call(
                node.parentNode.childNodes.filter(n => n.nodeType === Node.ELEMENT_NODE),
                node
            );
        }
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
	}
);
