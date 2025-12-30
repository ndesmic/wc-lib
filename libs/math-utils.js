/**
 * Linearly Interpolates between two numbers
 * @param {number} start 
 * @param {number} end 
 * @param {number} value Must be between 0 and 1 
 * @returns 
 */
export function lerp(start, end, value){
    return start + (end - start) * value;
}

/**
 * Clamps a number between two values
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function clamp(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	return Math.max(Math.min(value, max), min);
}

/**
 * Wraps a number between two values
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function wrap(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	return value < min
		? max - Math.abs(min - value) % range
		: min + (value + range) % range;
}

/**
 * Mirror wraps a number between two values
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function mirrorWrap(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	const minDistance = Math.abs(min - value);
	const intervalValue = minDistance % range;
	if (value % (max + max) > max) return max - intervalValue //too high (mirrored)
	if (value >= max) return min + intervalValue; //to high (unmirrored)
	if (value < min && minDistance % (range + range) > range) return max - intervalValue; //too low (mirrored)
	if (value <= min) return min + intervalValue; //to low (mirrored)
	return value;
}

/**
 * gets the fractional part of floating point number
 * @param {number} value 
 * @returns 
 */
export function getFractionalPart(value) {
	return Math.abs(value % 1);
}