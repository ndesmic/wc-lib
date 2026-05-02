/**
 * Trims only lines from the text  
 * @param {string} text 
 * @returns 
 */
export function trimLines(text) {
	return text.replace(/^(\r?\n)+/us, "")
		.replace(/(\r?\n)+$/us, "")
}

/**
 * dedents the text based on first line
 * @param {string} text 
 */
export function dedent(text) {
	const lines = text.split("\n");
	let char = lines[0].charAt(0);
	let count = 0;
	const spacingChar = char;
	if (!/[ \t]/.test(spacingChar)) {
		return text;
	}
	while (char === spacingChar) {
		count++;
		char = lines[0].charAt(count);
	}
	if (count === 0) {
		return text;
	}
	const regExp = new RegExp(`^${spacingChar}{${count}}`, "us");
	return lines.map(line => line.replace(regExp, "")).join("\n");
}

const htmlEntityRegExp = /(?=&)(.*?)(?<=;)/gus;
const htmlEntities = {
	"gt": ">",
	"lt": "<",
	"amp": "&",
	"nbsp": "\u00a0"
};
export function decodeHtml(text) {
	return text.replace(htmlEntityRegExp, value => {
		const entity = value.replace(/^&/, "").replace(/;$/, "");
		const entityString = htmlEntities[entity];
		if (entityString) {
			return entityString;
		}
		throw new Error(`decodeHtml doesn't support ${entity}`);
	});
}