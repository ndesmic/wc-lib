(function(){
const defaults = {
	points: undefined,
	width: 200,
	height: 200,
	xmax: 100,
	ymax: 100,
	xmin: -100,
	ymin: -100
};
const pointDefaults = {
	x: 0,
	y: 0,
	color: "#ff0000",
	size: 2,
	shape: "circle"
};
customElements.define("svg-graph",
	class extends HTMLElement {
		constructor(){
			super();
			this.attrs = { ...defaults };
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
			guides.setAttribute("d", `M0,${this.attrs.height/2} H${this.attrs.width} M${this.attrs.width/2},0 V${this.attrs.height}`);
			svg.appendChild(guides);
			this.attrs.points
				.map(p => {
					const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
					circle.setAttribute("cx", Util.window(p.x, this.attrs.xmin, this.attrs.xmax));
					circle.setAttribute("cy", Util.window(p.y, this.attrs.ymin, this.attrs.ymax, true));
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
			return ["points", "width", "height", "xmax", "xmin", "ymax", "ymin"];
		}
		set points(value){
			value = JSON.parse(value);
			if(Array.isArray(value[0])){ //array shorthand
				value = value.map(p => {
					return Util.trimObject({
						x: p[0],
						y: p[1],
						color: p[2],
						size: p[3],
						shape: p[4]
					});
				});
			}
			value = value.map(p => ({...pointDefaults, ...p}));
			this.attrs.points = value;
		}
		get points(){
			this.attrs.points || [];
		}
		set width(value){
			this.attrs.width = parseFloat(value);
		}
		set height(value){
			this.attrs.height = parseFloat(value);
		}
		set xmax(value){
			this.attrs.xmax = parseFloat(value);
		}
		set xmin(value){
			this.attrs.xmin = parseFloat(value);
		}
		set ymax(value){
			this.attrs.ymax = parseFloat(value);
		}
		set ymin(value){
			this.attrs.ymin = parseFloat(value);
		}
	}
)
})();
