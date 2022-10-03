function incrementToMax(count, max, step = 1){
	if(count < max){
		count += step;
	}
	return count;
}
function decrementToMin(count, min, step = 1) {
	if (count > min) {
		count -= step;
	}
	return count;
}

export class WcPresentation extends HTMLElement {
	#currentIndex = 0;
	#slides;
	static observedAttributes = [];

	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		element.attachEvents = element.attachEvents.bind(element);
		element.render = element.render.bind(element);
		element.cacheDom = element.cacheDom.bind(element);
		element.onKeydown = element.onKeydown.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
            <style>
				:host { display: block; overflow: hidden; position: relative; }
				#presentation { inline-size: 100%; block-size: 100%; display: block; }
            </style>
            	<slot></slot>
			</div>
        `;
	}
	connectedCallback() {
		this.render();
		this.#slides = Array.from(this.querySelectorAll("wc-slide"));
		this.cacheDom();
		this.attachEvents();
		this.#slides[this.#currentIndex].style.zIndex = 1;
	}
	cacheDom() {
		
	}
	onKeydown(e){
		this.#slides.forEach(element => {
			element.style.zIndex = 0;
		});
		if(e.which === 37){
			this.#currentIndex = decrementToMin(this.#currentIndex, 0);
		} else if (e.which === 39){
			this.#currentIndex = incrementToMax(this.#currentIndex, this.#slides.length - 1);
		} 
		this.#slides[this.#currentIndex].style.zIndex = 1;
	}
	attachEvents() {
		window.addEventListener("keydown", this.onKeydown);
	}
}

customElements.define("wc-presentation", WcPresentation);