function parseBasedInt(str){
	if(str.startsWith("0x")){
		return parseInt(str.slice(2), 16);
	}
	if(str.startsWith("0b")){
		return parseInt(str.slice(2), 2);
	}
	return parseInt(str, 10);
}

customElements.define("wc-font-preview",
	class extends HTMLElement {
		static get observedAttributes() {
			return ["range"];
		}
		constructor(){
			super();
			this.bind(this);
			this.range = "0x00-0xFFFF"
		}
		bind(element){
			element.attachEvents = element.attachEvents.bind(element);
			element.drop = element.drop.bind(element);
			element.render = element.render.bind(element);
			element.buildTable = element.buildTable.bind(element);
			element.cacheDom = element.cacheDom.bind(element);
			element.dragover = element.dragover.bind(element);
			element.dragleave = element.dragleave.bind(element);
		}
		connectedCallback(){
			this.render();
			this.cacheDom();
			this.attachEvents();
		}
		render(){
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; min-height:  100px; border: 1px solid black; } 
					:host(.drag-over) { border: 4px solid darkgreen; }
					.font {
						font-family: 'preview';
						font-weight: normal;
						font-style: normal;
					}
				</style>
				<div id="container"></div>
			`;
		}
		cacheDom(){
			this.dom = {
				container: this.shadowRoot.querySelector("#container")
			};
		}
		buildTable(){
			this.dom.container.innerHTML = "";
			const split = this.range.split("-");
			const start = parseBasedInt(split[0]);
			const end = parseBasedInt(split[1]); 
			const paragraphLength = Math.min((end - start) / 16);
			const table = document.createElement("table");

			for (let paragraph = 0; paragraph < paragraphLength; paragraph++) {
				const row = document.createElement("tr")

				for (let byte = 0; byte < 16; byte++) {
					const col = document.createElement("td");
					const value = start + (paragraph * 16) + byte;
					col.innerHTML = `&#${value};`;
					col.classList.add("font");
					col.dataset.code = value.toString(16).padStart(4, "0");
					row.appendChild(col);
				}

				table.appendChild(row);
			}

			this.dom.container.appendChild(table);
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
			const split = file.name.split(".");
			const ext = split[split.length - 1];
			const url = URL.createObjectURL(file);

			const style = document.createElement("style");
			style.textContent = `
				@font-face {
					font-family: "preview";
					src: url(${url}) format("${ext}");
					font-weight: normal;
					font-style: normal;
				}
			`;
			style.id = "font-style";

			const oldStyle = this.querySelector("#font-style");
			if(oldStyle){
				oldStyle.parentNode.removeChild(oldStyle);
			}

			this.appendChild(style);
			this.buildTable();
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
