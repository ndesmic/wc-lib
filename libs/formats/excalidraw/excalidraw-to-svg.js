// @ts-check
/**
 * @import { DomElement } from "../../dom.js")
 */
import { Dom } from "../../dom.js";
import { dedent, trimLines } from "../../string-utils.js";

const textMaskPadding = 8;
const textEncoder = new TextEncoder();

async function hashObject(obj, algorithm = "SHA-256") {
	const str = JSON.stringify(obj);
	const bytes = textEncoder.encode(str);
	const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
	const uint8 = new Uint8Array(hashBuffer);
	const hex = Array.from(uint8)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hex;
}

function join(...frags) {
	return frags.filter((f) => f).join("-");
}

/**
 * @typedef {{
 *   min: [number, number],
 *   max: [number, number]
 * }} Bounds
 * @typedef {{
 * 	id: string,
 *  type: string,
 *  isDeleted: boolean,
 *  height: number,
 *  width: number,
 *  strokeStyle: string,
 *  strokeWidth: number,
 *  strokeColor: `#${string}`,
 *  fillStyle: string,
 *  backgroundColor: `#${string}`,
 *  points: number[],
 *  roundness: { type: number },
 *  x: number,
 *  y: number,
 *  fontSize: number,
 *  verticalAlign: string,
 *  containerId?: string,
 *  text: string
 * }} ExcalidrawElement
 * @typedef {{
 * 	elements: ExcalidrawElement[]
 * }} Excalidraw
 * @typedef {{
 * 	fontUrl?: string,
 * 	includeFont?: boolean,
 *  shouldPrefixIds?: boolean,
 * 	shouldTrim?: boolean
 *  padding?: [number,number,number,number]
 * }} ExcalidrawToSvgOptions
 * @param {Excalidraw} excalidraw
 * @param {ExcalidrawToSvgOptions} options
 * @returns
 */
export async function excalidrawToSvg(excalidraw, options = {}) {
	const hash = options.shouldPrefixIds ? await hashObject(excalidraw) : "";
	const svg = Dom.createElement("svg");
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

	if (options.includeFont && options.fontUrl) {
		const fontStyle = createFontCss(options.fontUrl);
		svg.appendChild(fontStyle[0]);
		svg.appendChild(fontStyle[1]);
	}

	const colorHatches = computeUsedPatterns(excalidraw);
	const defs = Dom.createElement("defs");
	for (const colorHatch of colorHatches) {
		const pattern = createHatchPattern(colorHatch, hash);
		defs.appendChild(pattern);
	}

	/** @type {Bounds}  */
	let bounds = {
		min: [0, 0],
		max: [Infinity, Infinity],
	};
	if (options.shouldTrim) {
		bounds = computeBounds(excalidraw);
	}
	if (options.padding) {
		bounds.min[0] = bounds.min[0] - options.padding[0];
		bounds.min[1] = bounds.min[1] - options.padding[1];
		bounds.max[0] = bounds.max[0] + options.padding[2];
		bounds.max[1] = bounds.max[1] + options.padding[3];
	}
	if (options.shouldTrim) {
		svg.setAttribute("width", bounds.max[0] - bounds.min[0]);
		svg.setAttribute("height", bounds.max[1] - bounds.min[1]);
	}

	const state = {
		arrowInserted: false,
	};

	for (const element of excalidraw.elements) {
		let svgEl;
		if (element.isDeleted) continue;
		switch (element.type) {
			case "rectangle": {
				svgEl = Dom.createElement("rect");
				svgEl.setAttribute("height", element.height);
				svgEl.setAttribute("width", element.width);
				svgEl.setAttribute("x", element.x - bounds.min[0]);
				svgEl.setAttribute("y", element.y - bounds.min[1]);
				if (element.strokeColor) {
					svgEl.setAttribute("stroke", element.strokeColor);
				}
				if (element.strokeWidth) {
					svgEl.setAttribute("stroke-width", element.strokeWidth);
				}
				if (element.fillStyle === "solid") {
					svgEl.setAttribute("fill", element.backgroundColor);
				} else if (element.fillStyle === "hachure") {
					svgEl.setAttribute(
						"fill",
						`url(#${join(hash, "crosshatch", element.backgroundColor.slice(1))})`,
					);
				}

				const minDimension = Math.min(element.width, element.height);
				if (element.roundness?.type === 2) {
					const radius = minDimension / 4;
					svgEl.setAttribute("rx", `${radius}px`);
					svgEl.setAttribute("ry", `${radius}px`);
				} else if (element.roundness?.type === 3) {
					const maxRadius = 32;
					let radius = maxRadius;
					if (minDimension < maxRadius * 4) {
						radius = minDimension / 4;
					}
					svgEl.setAttribute("rx", `${radius}px`);
					svgEl.setAttribute("ry", `${radius}px`);
				}
				break;
			}
			case "line": {
				svgEl = Dom.createElement("line");
				svgEl.setAttribute("x1", element.x + element.points[0][0] - bounds.min[0]);
				svgEl.setAttribute("y1", element.y + element.points[0][1] - bounds.min[1]);
				svgEl.setAttribute("x2", element.x + element.points[1][0] - bounds.min[0]);
				svgEl.setAttribute("y2", element.y + element.points[1][1] - bounds.min[1]);
				svgEl.setAttribute("stroke", element.strokeColor);
				svgEl.setAttribute("stroke-width", element.strokeWidth);
				if (element.strokeStyle === "dashed") {
					svgEl.setAttribute("stroke-dasharray", "10 4");
				}
				break;
			}
			case "text": {
				svgEl = Dom.createElement("text");

				svgEl.setAttribute("id", join(hash, element.id));

				if (element.containerId) {
					const containerElement = excalidraw.elements.find((e) => e.id === element.containerId);
					if (!containerElement) {
						console.warn(`container element reference ${element.containerId} was not found, was the excalidraw file modified incorrectly?`);
						continue;
					}
					const box = getBox(containerElement, excalidraw.elements);
					svgEl.setAttribute("x", box.centerX - bounds.min[0]);
					svgEl.setAttribute("y", box.centerY - bounds.min[1]);
					svgEl.setAttribute("text-anchor", "middle");
					svgEl.setAttribute("dominant-baseline", "central");
				} else {
					svgEl.setAttribute("x", element.x - bounds.min[0]);
					svgEl.setAttribute("y", element.y - bounds.min[1]);
					svgEl.setAttribute("dominant-baseline", "hanging"); //excalidraw hangs text unlike default SVG
				}

				svgEl.setAttribute("font-size", element.fontSize);
				svgEl.setAttribute("vertical-align", element.verticalAlign);
				svgEl.setAttribute("fill", element.strokeColor);
				svgEl.setAttribute("stroke-width", 0); //no stroke only fill
				svgEl.appendChild(element.text);
				break;
			}
			case "ellipse": {
				svgEl = Dom.createElement("ellipse");
				svgEl.setAttribute("rx", element.width / 2);
				svgEl.setAttribute("ry", element.height / 2);
				svgEl.setAttribute("cx", element.x - bounds.min[0] + element.width / 2);
				svgEl.setAttribute("cy", element.y - bounds.min[1] + element.width / 2);
				svgEl.setAttribute("stroke", element.strokeColor);
				svgEl.setAttribute("stroke-width", element.strokeWidth);
				if (element.fillStyle === "solid") {
					svgEl.setAttribute("fill", element.backgroundColor);
				} else if (element.fillStyle === "hachure") {
					svgEl.setAttribute(
						"fill",
						`url(#crosshatch-${element.backgroundColor.slice(1)})`,
					);
				}
				if (element.strokeStyle === "dashed") {
					svgEl.setAttribute("stroke-dasharray", "10 4");
				}
				break;
			}
			case "arrow": {
				svgEl = renderArrow(element, {
					bounds,
					state,
					defs,
					elements: excalidraw.elements,
					hash,
				});
				break;
			}
			default: {
				throw new Error(`Unknown element type ${element.type}`);
			}
		}
		svg.appendChild(svgEl);
	}

	if (defs.children.length > 0) {
		svg.appendChild(defs);
	}
	return svg.toString();
}

/**
 *  @param {any} element
 *  @param {{
 *    bounds: { min: [number, number], max: [number, number] },
 *    state: { arrowInserted?: boolean },
 *    defs: DomElement,
 * 	 elements: ExcalidrawElement[],
 * 	 hash: string
 * 	}} options
 */
function renderArrow(element, options) {
	const svgEl = Dom.createElement("path");

	if (element.points.length === 3) {
		const p1 = [
			element.x - options.bounds.min[0] + element.points[0][0],
			element.y - options.bounds.min[1] + element.points[0][1],
		];
		const p2 = [
			element.x - options.bounds.min[0] + element.points[1][0],
			element.y - options.bounds.min[1] + element.points[1][1],
		];
		const p3 = [
			element.x - options.bounds.min[0] + element.points[2][0],
			element.y - options.bounds.min[1] + element.points[2][1],
		];

		const b1 = [
			p1[0] + (p2[0] - p1[0]) / 3,
			p1[1] + (p2[1] - p1[1]) / 3,
		].map((f) => f.toFixed(4));
		const b2 = [
			p2[0] - (p3[0] - p1[0]) / 6,
			p2[1] - (p3[1] - p1[1]) / 6,
		].map((f) => f.toFixed(4));
		const b3 = [
			p2[0] + (p3[0] - p1[0]) / 6,
			p2[1] + (p3[1] - p1[1]) / 6,
		].map((f) => f.toFixed(4));
		const b4 = [
			p3[0] - (p3[0] - p2[0]) / 2,
			p3[1] - (p3[1] - p2[1]) / 3,
		].map((f) => f.toFixed(4));

		svgEl.setAttribute(
			"d",
			`M ${p1.join(" ")} C ${b1.join(" ")}, ${b2.join(" ")}, ${p2.join(" ")} C ${b3.join(" ")}, ${b4.join(" ")}, ${p3.join(" ")}`,
		);
	} else if (element.points.length === 2) {
		const p1 = [
			element.x - options.bounds.min[0] + element.points[0][0],
			element.y - options.bounds.min[1] + element.points[0][1],
		];
		const p2 = [
			element.x - options.bounds.min[0] + element.points[1][0],
			element.y - options.bounds.min[1] + element.points[1][1],
		];

		svgEl.setAttribute(
			"d",
			`M ${p1.join(" ")} L ${p2.join(" ")}`,
		);
	}
	svgEl.setAttribute("stroke", element.strokeColor);
	svgEl.setAttribute("stroke-width", element.strokeWidth);
	svgEl.setAttribute("fill", "transparent");
	if (element.strokeStyle === "dashed") {
		svgEl.setAttribute("stroke-dasharray", "10 4");
	}
	if (element.endArrowhead === "arrow" && !options.state.arrowInserted) {
		const markerSize = 10;
		const marker = Dom.createElement("marker");
		marker.setAttribute("id", join(options.hash, "arrow"));
		marker.setAttribute("viewBox", `0 0 ${markerSize} ${markerSize}`);
		marker.setAttribute("refX", markerSize);
		marker.setAttribute("refY", markerSize / 2);
		marker.setAttribute("markerWidth", markerSize);
		marker.setAttribute("markerHeight", markerSize);
		marker.setAttribute("orient", "auto-start-reverse");
		const path = Dom.createElement("path");
		path.setAttribute(
			"d",
			`M 0 0 L ${markerSize} ${markerSize / 2} L 0 ${markerSize}`,
		);
		path.setAttribute("stroke", element.strokeColor);
		path.setAttribute("stroke-width", 1);
		path.setAttribute("fill", "transparent");
		marker.appendChild(path);
		options.defs.appendChild(marker);
		options.state.arrowInserted = true;
	}
	if (element.boundElements?.length > 0) {
		for (const boundElementRef of element.boundElements) {
			if (boundElementRef.type === "text") {
				const boundElement = options.elements.find((e) => e.id === boundElementRef.id);
				if (!boundElement) {
					console.warn(`bound element reference ${boundElementRef.id} was not found, was the excalidraw file modified incorrectly?`);
					continue;
				}
				const mask = getTextBackgroundMask(boundElement, { elements: options.elements, bounds: options.bounds, hash: options.hash });
				options.defs.appendChild(mask);
				svgEl.setAttribute("mask", `url(#${join(options.hash, "mask", boundElement.id)})`);
			}
		}
	}
	svgEl.setAttribute("marker-end", `url(#${join(options.hash, "arrow")})`);
	return svgEl;
}

/**
 * @param {ExcalidrawElement} textElement
 * @param {{
 * 	elements: ExcalidrawElement[],
 * 	bounds: Bounds,
 *  hash: string
 * }} options
 * @returns
 */
function getTextBackgroundMask(textElement, options) {
	const mask = Dom.createElement("mask");
	mask.setAttribute("id", join(options.hash, "mask", textElement.id));
	mask.setAttribute("maskUnits", "userSpaceOnUse");

	const rectCanvas = Dom.createElement("rect");
	rectCanvas.setAttribute("x", 0);
	rectCanvas.setAttribute("y", 0);
	rectCanvas.setAttribute("width", "100%");
	rectCanvas.setAttribute("height", "100%");
	rectCanvas.setAttribute("fill", "#FFF");
	mask.appendChild(rectCanvas);

	const box = getBox(textElement, options.elements);

	const rect = Dom.createElement("rect");
	rect.setAttribute("x", box.x - options.bounds.min[0] - textMaskPadding);
	rect.setAttribute("y", box.y - options.bounds.min[1] - textMaskPadding);
	rect.setAttribute("width", box.width + textMaskPadding * 2);
	rect.setAttribute("height", box.height + textMaskPadding * 2);
	rect.setAttribute("fill", "#000");
	mask.appendChild(rect);
	return mask;
}

/**
 * @param {ExcalidrawElement} element
 * @param {ExcalidrawElement[]} elements
 * @returns
 */
function getBox(element, elements) {
	if (!element) {
		console.log(element);
	}
	switch (element.type) {
		case "line": {
			const x1 = element.x + element.points[0][0];
			const x2 = element.x + element.points[1][0];
			const y1 = element.y + element.points[0][1];
			const y2 = element.y + element.points[1][1];

			return {
				x: Math.min(x1, x2),
				y: Math.min(y1, y2),
				width: Math.abs(x2 - x1),
				height: Math.abs(y2 - y1),
				centerX: (x2 + x1) / 2,
				centerY: (y2 + y1) / 2,
			};
		}
		case "arrow": { //might be wrong
			if (element.points.length === 2) {
				const x1 = element.x + element.points[0][0];
				const x2 = element.x + element.points[1][0];
				const y1 = element.y + element.points[0][1];
				const y2 = element.y + element.points[1][1];
				return {
					x: Math.min(x1, x2),
					y: Math.min(y1, y2),
					width: Math.abs(x2 - x1),
					height: Math.abs(y2 - y1),
					centerX: (x2 + x1) / 2,
					centerY: (y2 + y1) / 2,
				};
			} else if (element.points.length === 3) {
				const x1 = element.x + element.points[0][0];
				const x2 = element.x + element.points[2][0];
				const y1 = element.y + element.points[0][1];
				const y2 = element.y + element.points[2][1];

				const cx = element.x + element.points[1][0];
				const cy = element.y + element.points[1][1];
				return {
					x: Math.min(x1, x2),
					y: Math.min(y1, y2),
					width: Math.abs(x2 - x1),
					height: Math.abs(y2 - y1),
					centerX: cx,
					centerY: cy,
				};
			} else {
				throw new Error(`Can't compute >3 point arrow`);
			}
		}
		case "rectangle": {
			return {
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height,
				centerX: (element.x + element.x + element.width) / 2,
				centerY: (element.y + element.y + element.height) / 2,
			};
		}
		case "text": {
			if (element.containerId) {
				const containerElement = elements.find((e) => e.id === element.containerId);
				if (!containerElement) {
					throw new Error(`container element not found ${element.containerId}.  Was the file modified?`);
				}
				const box = getBox(containerElement, elements);
				const x = box.centerX - (element.width / 2);
				const y = box.centerY - (element.height / 2);

				return {
					x,
					y,
					width: element.width,
					height: element.height,
					centerX: (element.x + element.x + element.width) / 2,
					centerY: (element.y + element.y + element.height) / 2,
				};
			}
			return {
				x: element.x,
				y: element.y,
				width: element.width,
				height: element.height,
				centerX: (element.x + element.x + element.width) / 2,
				centerY: (element.y + element.y + element.height) / 2,
			};
		}
		default: {
			throw new Error(`Cannot get midpoint of type: ${element.type}`);
		}
	}
}

/**
 * @param {Excalidraw} excalidraw
 * @returns
 */
function computeBounds(excalidraw) {
	const minPoint = /**@type [number, number] */ ([Infinity, Infinity]);
	const maxPoint = /**@type [number, number] */ ([0, 0]);
	for (const element of excalidraw.elements) {
		if (element.isDeleted) continue;
		switch (element.type) {
			case "line":
			case "arrow": { //we need to measure both direction because the line can move negative directions
				minPoint[0] = Math.min(element.x + element.points[0][0], minPoint[0]);
				minPoint[1] = Math.min(element.y + element.points[0][1], minPoint[1]);
				minPoint[0] = Math.min(element.x + element.points[1][0], minPoint[0]);
				minPoint[1] = Math.min(element.y + element.points[1][1], minPoint[1]);

				maxPoint[0] = Math.max(element.x + element.points[0][0], maxPoint[0]);
				maxPoint[1] = Math.max(element.y + element.points[0][1], maxPoint[1]);
				maxPoint[0] = Math.max(element.x + element.points[1][0], maxPoint[0]);
				maxPoint[1] = Math.max(element.y + element.points[1][1], maxPoint[1]);
				break;
			}
			default: {
				minPoint[0] = Math.min(element.x, minPoint[0]);
				minPoint[1] = Math.min(element.y, minPoint[1]);
				maxPoint[0] = Math.max(element.x + element.width, maxPoint[0]);
				maxPoint[1] = Math.max(element.y + element.height, maxPoint[1]);
			}
		}
	}

	return {
		min: minPoint,
		max: maxPoint,
	};
}

/**
 * @param {string} fontUrl
 * @returns
 */
function createFontCss(fontUrl) {
	const fontFaceStyle = Dom.createElement("style");
	fontFaceStyle.appendChild(dedent(trimLines(`
				@font-face {
					font-family: "excalifont";
					src: url("${fontUrl}") format("woff2");
				}`)));

	const fontStyle = Dom.createElement("style");

	fontStyle.appendChild(dedent(trimLines(`
            text {
            	font-family: "excalifont", sans-serif;
            }`)));
	return [fontFaceStyle, fontStyle];
}

/**
 * @param {Excalidraw} excalidraw
 * @returns
 */
function computeUsedPatterns(excalidraw) {
	const colorHatchSet = new Set();
	for (const element of excalidraw.elements) {
		if (element.isDeleted) continue;
		if (element.fillStyle === "hachure") {
			colorHatchSet.add(element.backgroundColor);
		}
	}
	return colorHatchSet.values().toArray();
}

/**
 * @param {`#${string}`} color
 * @param {string} hash
 * @returns
 */
function createHatchPattern(color, hash) {
	const hatchSize = 10;
	const pattern = Dom.createElement("pattern");
	pattern.setAttribute("patternUnits", "userSpaceOnUse");
	pattern.setAttribute("width", hatchSize);
	pattern.setAttribute("height", hatchSize);
	pattern.setAttribute("id", join(hash, "crosshatch", color.slice(1)));
	const hatchLine = Dom.createElement("line");
	hatchLine.setAttribute("x1", 0);
	hatchLine.setAttribute("x2", hatchSize);
	hatchLine.setAttribute("y1", hatchSize);
	hatchLine.setAttribute("y2", 0);
	hatchLine.setAttribute("stroke-width", 1);
	hatchLine.setAttribute("stroke", color);
	pattern.appendChild(hatchLine);
	return pattern;
}
