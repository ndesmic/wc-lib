customElements.define("drop-file",
	class extends HTMLElement {
		static get observedAttributes() {
			return ["type", "encoding"];
		}
		constructor(){
			super();
			this.bind(this);
			this.attachEvents();
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
			element.drop = element.drop.bind(element);
			element.load = element.load.bind(element);
			element.dragover = element.dragover.bind(element);
			element.dragleave = element.dragleave.bind(element);
		}
		attachEvents(){
			this.addEventListener("dragover", this.dragover);
			this.addEventListener("dragleave", this.dragleave);
			this.addEventListener("drop", this.drop);
		}
		async drop(e){
			e.preventDefault();
			this.classList.remove("dragover");
			const file = e.dataTransfer.files[0];
			const result = await this.load(file);
			const event = document.createEvent("HTMLEvents");
			event.initEvent("gotfile", true, true );
			event.data = result;
			this.dispatchEvent(event);
		}
		load(file){
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = reject;
				reader.onload = e => resolve(e.target.result);
				switch(this.type){
					case "binary":
						reader.readAsBinaryString(file);
						break;
					case "url":
						reader.readAsDataURL(file);
						break;
					case "arrayBuffer":
						reader.readAsArrayBuffer(file);
						break;
					case "text":
					default:
						reader.readAsText(file, this.encoding || "utf8");
						break;
				}
			});
		}
		dragover(e){
			e.preventDefault();
			e.stopPropagation();
			this.classList.add("dragover");
		}
		dragleave(e){
			e.preventDefault();
			e.stopPropagation();
			this.classList.remove("dragover");
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
	}
);
