import { clamp, getFractionalPart, mirrorWrap, wrap } from "./math-utils.js";
import { lerpVector } from "./vector-utils.js";
/** @typedef {"clamp" | "wrap" | "mirror"} OobBehavior */

/**
 * Samples a pixel from ImageData using bounding behavior and bilinear filtering (0-1 normalized)
 * @param {ImageData} imageData 
 * @param {number} col 
 * @param {number} row 
 * @param {OobBehavior} oobBehavior 
 * @returns 
 */
export function sample(imageData, col, row, oobBehavior) {
	const columnStartIndex = Math.floor(col);
    const columnEndIndex = Math.ceil(col);
    const columnFraction = getFractionalPart(col);

    const rowStartIndex = Math.floor(row);
    const rowEndIndex = Math.ceil(row);
    const rowFraction = getFractionalPart(row);

    const rowStartColumnStartPx = getPx(imageData, columnStartIndex, rowStartIndex, oobBehavior);
    const rowEndColumnStartPx = getPx(imageData, columnStartIndex, rowEndIndex, oobBehavior);
    const rowStartColumnEndPx = getPx(imageData, columnEndIndex, rowStartIndex, oobBehavior);
    const rowEndColumnEndPx = getPx(imageData, columnEndIndex, rowEndIndex, oobBehavior);

    const rowStartPx = lerpVector(rowStartColumnStartPx, rowStartColumnEndPx, columnFraction);
    const rowEndPx = lerpVector(rowEndColumnStartPx, rowEndColumnEndPx, columnFraction);
	const finalPx = lerpVector(rowStartPx, rowEndPx, rowFraction);

    return finalPx;
}

/**
 * Bounds a value between min and max using specified out-of-bounds behavior
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @param {OobBehavior} oobBehavior 
 * @returns 
 */
function bound(value, min, max, oobBehavior){
    switch(oobBehavior){
        case "wrap": {
            return wrap(value, min, max);
        }
        case "mirror": {
            return mirrorWrap(valie, min, max);
        }
        case "clamp":
        default: {
            return clamp(value, min, max);
        }
    }
}

/**
 * Gets a rgb pixel value from image data using bounding behavior (0-1 normalized)
 * @param {ImageData} imageData 
 * @param {number} row 
 * @param {number} col 
 * @param {OobBehavior} oobBehavior 
 * @returns 
 */
export function getPx(imageData, col, row, oobBehavior){
    const boundedCol = bound(Math.floor(col), 0, imageData.width - 1, oobBehavior);
    const boundedRow = bound(Math.floor(row), 0, imageData.height - 1, oobBehavior);
    const offset = (boundedRow * imageData.width * 4) + (boundedCol * 4);
    return [
		imageData.data[offset + 0] / 255,
		imageData.data[offset + 1] / 255,
		imageData.data[offset + 2] / 255,
		imageData.data[offset + 3] / 255
	];
}

/**
 * Sets a pixel of image data (0-1 normalized)
 * @param {ImageData} imageData 
 * @param {number} col 
 * @param {number} row 
 * @param {number[]} value 
 * @returns 
 */
export function setPx(imageData, col, row, value) {
	const normalizedCol = clamp(col, 0, imageData.width);
	const normalizedRow = clamp(row, 0, imageData.height);
	const offset = (normalizedRow * imageData.width * 4) + (normalizedCol * 4);
	return [
		imageData.data[offset + 0] = value[0] * 255,
		imageData.data[offset + 1] = value[1] * 255,
		imageData.data[offset + 2] = value[2] * 255,
		imageData.data[offset + 3] = value[3] * 255
	]
}