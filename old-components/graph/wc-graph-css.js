function windowValue(v, vmin, vmax, flipped = false) {
	v = flipped ? -v : v;
	return (v - vmin) / (vmax - vmin);
}
function hyphenCaseToCamelCase(text) {
	return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function createShape(shape, [x, y], size, color, value, previousY){
	const td = document.createElement("td");
	td.style.setProperty("--y", y + "px");
	td.style.setProperty("--prev-y", previousY + "px");
	td.style.setProperty("--size", size + "px");
	td.style.setProperty("--color", color);
	td.textContent = value;

	switch(shape){
		case "circle": {
			td.classList.add("circle");
		}
	}

	return td;
}

class WcGraphCss extends HTMLElement {
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
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
		}
		this.shadowRoot.innerHTML = "";
		
		let points;
		if (this.#func) {
			points = [];
			for (let x = this.#xmin; x < this.#xmax; x += this.#step) {
				const y = this.#func(x);
				points.push({ x, y, color: this.#defaultColor, size: this.#defaultSize, shape: this.#defaultShape });
			}
		} else {
			points = this.#points;
		}

		points = points.map((p, i, arr) => ({
			x: windowValue(p.x, this.#xmin, this.#xmax) * this.#width,
			y: windowValue(p.y, this.#ymin, this.#ymax, true) * this.#height,
			value: p.y,
			color: p.color,
			size: p.size,
			shape: p.shape
		}));

		points.sort((a,b) => b.x - a.x).reverse();

		points = points.map((p, i, arr) => ({
			...p,
			...{
				width: p.x - (arr[i - 1]?.x ?? 0),
				previousY: (arr[i - 1]?.y ?? 0)
			}
		}));

		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = "./wc-graph-css.css";
		this.shadowRoot.append(style);

		const table = document.createElement("table");
		table.style.setProperty("--default-color", this.#defaultColor);
		table.style.setProperty("--thickness", this.#thickness + "px");
		if(this.#continuous){
			table.classList.add("continuous");
		}
		table.style.width = this.#width + "px";
		table.style.height = this.#height + "px";
		const tbody = document.createElement("tbody");
		tbody.style.gridTemplateColumns = points.map(p => p.width + "px").join(" ");
		table.append(tbody);
		for (const point of points) {
			const tr = document.createElement("tr");
			const td = createShape(point.shape, [point.x, point.y], point.size, point.color, point.value, point.previousY);
			tr.append(td);
			tbody.append(tr);
		}
		table.append(tbody);
		this.shadowRoot.append(table);
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
		if (typeof (value) === "string") {
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
	set defaultSize(value) {
		this.#defaultSize = parseFloat(value);
	}
	set defaultShape(value) {
		this.#defaultShape = value;
	}
	set defaultColor(value) {
		this.#defaultColor = value;
	}
	set continuous(value) {
		this.#continuous = value !== undefined;
	}
	set thickness(value) {
		this.#thickness = parseFloat(value);
	}
}

customElements.define("wc-graph-css", WcGraphCss);
