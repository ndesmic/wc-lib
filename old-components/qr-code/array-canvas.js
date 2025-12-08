export class ArrayCanvas {
	#height = 0;
	#width = 0;
	#outOfBoundsBehavior;
	#canvas;

	constructor(options = {}) {
		this.#height = options.height ?? 0;
		this.#width = options.width ?? 0;
		this.#outOfBoundsBehavior = options.outOfBoundsBehavior ?? "throw";
		this.#alloc();
	}
	set height(value){
		this.#height = value;
		this.#alloc();
	}
	get height(){
		return this.#height;
	}
	set width(value){
		this.#width = value;
		this.#alloc();
	}
	get width(){
		return this.#width;
	}
	get data(){
		return this.#canvas;
	}
	#alloc(){
		this.#canvas = new Array(this.#height * this.#width).fill(0);
	}
	reset(){
		this.#alloc();
	}
	drawVerticalLine(startX, startY, length, value) {
		for (let i = 0; i < length; i++) {
			this.drawPixel(startX, startY + i, value);
		}
	}
	drawHorizontalLine(startX, startY, length, value) {
		for (let i = 0; i < length; i++) {
			this.drawPixel(startX + i, startY, value);
		}
	}
	drawOutlineRect(startX, startY, width, height, value) {
		this.drawHorizontalLine(startX, startY, width, value);
		this.drawVerticalLine(startX + (width - 1), startY, height, value);
		this.drawVerticalLine(startX, startY, height, value);
		this.drawHorizontalLine(startX, (startY + height - 1), width, value);
	}
	drawFilledRect(startX, startY, width, height, value) {
		for (let row = startY; row < startY + height; row++) {
			for (let col = startX; col < startX + width; col++) {
				this.drawPixel(row, col, value);
			}
		}
	}
	drawPixel(x, y, value) {
		if(value === undefined) {
			throw new Error("No value");
		}
		if(x >= this.#width || x < -this.#width){
			switch(this.#outOfBoundsBehavior){
				case "throw": {
					throw new Error(`Out of bounds: x:${x}, y:${y}, width: ${this.#width}, height: ${this.#height}`);
				}
				case "ignore": {
					return;
				}
			}
		}
		if (y >= this.height || y < -this.height){
			switch(this.#outOfBoundsBehavior){
				case "throw": {
					throw new Error(`Out of bounds: x:${x}, y:${y}, width: ${this.#width}, height: ${this.#height}`);
				}
				case "ignore": {
					return;
				}
			}
		}
		if(x < 0){
			x = this.#width + x;
		}
		if(y < 0){
			y = this.#height + y;
		}
		this.#canvas[(y * this.#width) + x] = value;
	}
	getPixel(x, y) {
		//add negative indexing...
		return this.#canvas[(y * this.#width) + x];
	}
	//super unoptimized :(
	print(){
		const result = [];
		for(let i = 0; i < this.#canvas.length; i++){
			result.push(this.#canvas[i].toString() + (i % this.#width === this.#width - 1 ? "\n" : ","));
		}
		return result.join("").trim();
	}
}
