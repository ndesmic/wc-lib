function incrementToMax(count, max, step = 1) {
	if (count < max) {
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


export class WcSlideDeck extends HTMLElement {
	static observedAttributes = [];
	#currentIndex = 0;
	#slides;
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
		this.attachEvents = this.attachEvents.bind(element);
		this.onKeydown = this.onKeydown.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
					width: 1080px;
					height: 720px;
				}
				#slide-deck { 
					::slotted(wc-slide) {  
						grid-area: 1/1; width: 100%; height: 100%;
					}
					::slotted(wc-slide.active) {
						z-index: 1;
					}
					width: 100%;
					height: 100%;
					display: grid; 
				}
            </style>
			<div id="slide-deck">
				<slot />
			</div>
        `;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
		this.attachEvents();
	}
	cacheDom() {
		this.#slides = Array.from(this.querySelectorAll("wc-slide"));
		this.#slides[0].style.zIndex = 1;
		this.dom = {};
	}
	attachEvents(){
		window.addEventListener("keydown", this.onKeydown);
	}
	onKeydown(e) {
		this.#slides.forEach(element => {
			element.classList.remove("active");
		});
		if (e.which === 37) {
			this.#currentIndex = decrementToMin(this.#currentIndex, 0);
		} else if (e.which === 39) {
			this.#currentIndex = incrementToMax(this.#currentIndex, this.#slides.length - 1);
		}
		document.startViewTransition(() => {
			this.#slides[this.#currentIndex].classList.add("active");
		});
		
	}
}

customElements.define("wc-slide-deck", WcSlideDeck);

/**
 * SLIDE
 */

export class WcSlide extends HTMLElement {
	static observedAttributes = [];
	constructor() {
		super();
		this.bind(this);
	}
	bind(element) {
		this.render = this.render.bind(element);
		this.cacheDom = this.cacheDom.bind(element);
	}
	render() {
		this.attachShadow({ mode: "open" });

		this.shadowRoot.innerHTML = `
            <style>
                :host {
					display: block;
				}
            </style>
			<div>
				<slot />
			</div>
        `;
	}
	connectedCallback() {
		this.render();
		this.cacheDom();
	}
	cacheDom() {
		this.dom = {};
	}
}

customElements.define("wc-slide", WcSlide);

