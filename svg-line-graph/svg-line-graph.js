(function(){
const pointDefaults = {
	value: 0,
	color: "#ff0000",
	size: 2,
	shape: "circle"
};
customElements.define("svg-line-graph",
	class extends HTMLElement {
		constructor(){
			super();
			this.attrs = {};
			this.bind(this);
		}
		bind(element){
			element.attachEvents.bind(element);
		}
		render(){
			this.innerHTML = "";
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("width", this.attrs.width);
			svg.setAttribute("height", this.attrs.height);
			const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			background.setAttribute("width", this.attrs.width);
			background.setAttribute("height", this.attrs.height);
			background.setAttribute("fill", "white");
			svg.appendChild(background);
			const guides = document.createElementNS("http://www.w3.org/2000/svg", "path");
			guides.setAttribute("stroke-width", 1.0);
			guides.setAttribute("stroke", "black");
			guides.setAttribute("d", `M${Util.window(0, this.attrs.min, this.attrs.max, this.attrs.width)},0 V${this.attrs.height}`);
			svg.appendChild(guides);
			this.points
				.map(p => {
					const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					circle.setAttribute("cx", Util.window(p.value, this.attrs.min, this.attrs.max, this.attrs.width));
					circle.setAttribute("cy", Util.center(p.size, 0, this.attrs.height));
					circle.setAttribute("r", p.size);
					circle.setAttribute("fill", p.color);
					return circle;
				})
				.forEach(c => svg.appendChild(c));
			this.appendChild(svg);
		}
		attachEvents(){

		}
		connectedCallback(){
			this.render();
			this.attachEvents();
		}
		attributeChangedCallback(name, oldValue, newValue){
			this[name] = newValue;
		}
		static get observedAttributes(){
			return ["points", "width", "height", "min", "max"];
		}
		set points(value){
			value = JSON.parse(value);
			if(Array.isArray(value[0])){ //array shorthand
				value = value.map(p => {
					return Util.trimObject({
						value: p[0],
						color: p[1],
						size: p[2],
						shape: p[3]
					});
				});
			}
			value = value.map(p => ({...pointDefaults, ...p}));
			this.attrs.points = value;
			this.render();
		}
		get points(){
			return this.attrs.points || [];
		}
		set width(value){
			this.attrs.width = parseFloat(value);
		}
		get width(){
			return this.attrs.width || 200;
		}
		set height(value){
			this.attrs.height = parseFloat(value);
		}
		get height(){
			return this.attrs.height || 10;
		}
		set max(value){
			this.attrs.max = parseFloat(value);
		}
		get max(){
			return this.attrs.max || 100;
		}
		set min(value){
			this.attrs.min = parseFloat(value);
		}
		get min(){
			return this.attrs.min || -100;
		}
	}
)
})();
