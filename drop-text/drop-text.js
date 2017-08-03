customElements.define("drop-text",
	class extends HTMLElement {
		static get observedAttributes(){
			return ["storage-key", "value", "placeholder"];
		}
		constructor(){
			super();
			this.bind(this);
			this.wrappedInput = document.createElement("textarea");
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
			element.createShadowDom = element.createShadowDom.bind(element);
			element.cacheDom = element.cacheDom.bind(element);
			element.onDragOver = element.onDragOver.bind(element);
			element.onDragLeave = element.onDragLeave.bind(element);
			element.onDrop = element.onDrop.bind(element);
			element.onInput = element.onInput.bind(element);
			element.raiseEvent = element.raiseEvent.bind(element);
		}
		connectedCallback(){
			this.createShadowDom();
			this.cacheDom();
			this.wrappedInput.value = this.value;
			this.attachEvents();
			this.raiseEvent("loadedvalue", this.value);
			this.onInput();
		}
		createShadowDom(){
			this.shadow = this.attachShadow({ mode : "closed" });
			this.shadow.innerHTML = `
				<style>
					:host { display: block; }
					textarea { width: 100%; height: 100%; background: transparent; box-sizing: border-box;}
					:host(.drag-over) textarea { background: var(--positive-background); }
				</style>
			`;
			this.shadow.appendChild(this.wrappedInput);
		}
		cacheDom(){
			this.dom = {};
		}
		attachEvents(){
			this.addEventListener("dragover", this.onDragOver);
			this.addEventListener("dragleave", this.onDragLeave);
			this.addEventListener("drop", this.onDrop);
			this.wrappedInput.addEventListener("input", this.onInput);
		}
		onDragOver(e){
			e.preventDefault();
			this.classList.add("drag-over");
		}
		onDragLeave(e){
			e.preventDefault();
			this.classList.remove("drag-over");
		}
		onDrop(e){
			e.preventDefault();
			this.classList.remove("drag-over");
			const file = e.dataTransfer.files[0];
			const fileReader = new FileReader();
			fileReader.onload = e => this.value  = e.target.result;
			fileReader.onerror = () => this.classList.add("error");
			fileReader.readAsText(file);
		}
		onInput(){
			localStorage.setItem(this["storage-key"], this.wrappedInput.value);
			this.raiseEvent("change", this.value);
		}
		raiseEvent(eventName, payload) {
			const event = document.createEvent("HTMLEvents");
			event.initEvent(eventName, true, true);
			event.data = payload;
			this.dispatchEvent(event);
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
		set placeholder(value) {
			this.wrappedInput.placeholder = value;
		}
		get placeholder(){
			return this.wrappedInput.placeholder;
		}
		set value(value){
			this.wrappedInput.value = value;
			this.onInput();
		}
		get value(){
			return this.wrappedInput.value || localStorage.getItem(this["storage-key"]);
		}
	}
)
