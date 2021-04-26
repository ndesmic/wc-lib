function windowValue(v, vmin, vmax, flipped = false) {
	v = flipped ? -v : v;
	return (v - vmin) / (vmax - vmin);
}
function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}
function createShape(shape, [x, y], size, color){
	switch(shape){
		case "circle": {
			const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute("cx", x);
			circle.setAttribute("cy", y);
			circle.setAttribute("r", size);
			circle.setAttribute("fill", color);
			return circle;
		}
		case "square": {
			const halfSize = size / 2;
			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.setAttribute("x", x - halfSize);
			rect.setAttribute("y", y - halfSize);
			rect.setAttribute("width", size);
			rect.setAttribute("height", size);
			rect.setAttribute("fill", color);
			return rect;
		}
	}
}

class WcGraphSvg extends HTMLElement {
	#points = [];
	#width = 320;
	#height = 240;
	#xmax = 100;
	#xmin = -100;
	#ymax = 100;
	#ymin = -100;
	#func;
	#step = 1;
	#thickness = 1;
	#continuous = false;

	#defaultShape = "circle";
	#defaultSize = 2;
	#defaultColor = "#F00"

	static observedAttributes = ["points", "func", "step", "width", "height", "xmin", "xmax", "ymin", "ymax", "default-shape", "default-size", "default-color", "continuous", "thickness"];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents.bind(element);
	}
	render() {
		if(!this.shadowRoot){
			this.attachShadow({ mode: "open" });
		}
		this.shadowRoot.innerHTML = "";
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", this.#width);
		svg.setAttribute("height", this.#height);
		const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		background.setAttribute("width", this.#width);
		background.setAttribute("height", this.#height);
		background.setAttribute("fill", "white");
		svg.appendChild(background);
		const guides = document.createElementNS("http://www.w3.org/2000/svg", "path");
		guides.setAttribute("stroke-width", 1.0);
		guides.setAttribute("stroke", "black");
		guides.setAttribute("d", `M0,${this.#height / 2} H${this.#width} M${this.#width / 2},0 V${this.#height}`);
		svg.appendChild(guides);

		let points;
		if(this.#func){
			points = [];
			for (let x = this.#xmin; x < this.#xmax; x += this.#step) {
				const y = this.#func(x);
				points.push({ x, y, color: this.#defaultColor, size: this.#defaultSize, shape: this.#defaultShape});
			}
		} else {
			points = this.#points;
		}

		points = points.map(p => ({ 
			x: windowValue(p.x, this.#xmin, this.#xmax) * this.#width,
			y: windowValue(p.y, this.#ymin, this.#ymax, true) * this.#height,
			color: p.color,
			size: p.size,
			shape: p.shape
		 }));

		if(this.#continuous){
			const pathData = ["M"];
			pathData.push(points[0].x.toFixed(2), points[0].y.toFixed(2));

			for (let i = 1; i < points.length; i++) {
				pathData.push("L", points[i].x.toFixed(2), points[i].y.toFixed(2));
			}
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("fill", "none");
			path.setAttribute("stroke-width", this.#thickness);
			path.setAttribute("stroke", this.#defaultColor);
			path.setAttribute("d", pathData.join(" "));
			svg.appendChild(path);
		}

		for(const point of points){
			const shape = createShape(
				point.shape, 
				[point.x, point.y],
				point.size,
				point.color
			);
			svg.appendChild(shape);
		}
		this.shadowRoot.appendChild(svg);
	}
	attachEvents() {

	}
	connectedCallback() {
		this.render();
		this.attachEvents();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		this[hyphenCaseToCamelCase(name)] = newValue;
	}
	set points(value) {
		if(typeof(value) === "string"){
			value = JSON.parse(value);
		}

		value = value.map(p => ({
			x: p[0],
			y: p[1],
			color: p[2] ?? this.#defaultColor,
			size: p[3] ?? this.#defaultSize,
			shape: p[4] ?? this.#defaultShape
		}));

		this.#points = value;

		this.render();
	}
	get points() {
		return this.#points;
	}
	set width(value) {
		this.#width = parseFloat(value);
	}
	get width() {
		return this.#width;
	}
	set height(value) {
		this.#height = parseFloat(value);
	}
	get height() {
		return this.#height;
	}
	set xmax(value) {
		this.#xmax = parseFloat(value);
	}
	get xmax() {
		return this.#xmax;
	}
	set xmin(value) {
		this.#xmin = parseFloat(value);
	}
	get xmin() {
		return this.#xmin;
	}
	set ymax(value) {
		this.#ymax = parseFloat(value);
	}
	get ymax() {
		return this.#ymax;
	}
	set ymin(value) {
		this.#ymin = parseFloat(value);
	}
	get ymin() {
		return this.#ymin;
	}
	set func(value) {
		this.#func = new Function(["x"], value);
		this.render();
	}
	set step(value) {
		this.#step = parseFloat(value);
	}
	set defaultSize(value){
		this.#defaultSize = parseFloat(value);
	}
	set defaultShape(value) {
		this.#defaultShape = value;
	}
	set defaultColor(value) {
		this.#defaultColor = value;
	}
	set continuous(value){
		this.#continuous = value !== undefined;
	}
	set thickness(value){
		this.#thickness = parseFloat(value);
	}
}

customElements.define("wc-graph-svg", WcGraphSvg);
