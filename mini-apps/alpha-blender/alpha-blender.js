import { addVector, scaleVector, subtractVector } from "./vector.js";

const topColorInput = document.querySelector("#top-color"); 
const bottomColorInput = document.querySelector("#bottom-color");
const alphaInput = document.querySelector("#alpha");
const ouput = document.querySelector("#output");
const swatch = document.querySelector("#swatch");

function parseColor(text){
	text = text.replace(/^#/, "");
	return [
		parseInt(text.substring(0,2), 16),
		parseInt(text.substring(2,4), 16),
		parseInt(text.substring(4,6), 16)
	];
}

function update(){
	const topColor = parseColor(topColorInput.value);
	const bottomColor = parseColor(bottomColorInput.value);
	const alpha = parseFloat(alphaInput.value);

	const result = addVector(bottomColor, scaleVector(subtractVector(topColor, bottomColor), alpha));
	const hexResult = result.map(x => Math.round(x).toString(16))
	ouput.value = `${result.join(", ")} (#${hexResult.join("")})`;
	swatch.style.backgroundColor = `#${hexResult.join("")}`;
}

topColorInput.addEventListener("input", update);
bottomColorInput.addEventListener("input", update);
alphaInput.addEventListener("input", update);
update();

