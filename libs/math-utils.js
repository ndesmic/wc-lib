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
export function wrapFloat(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min;
	return value < min
		? max - Math.abs(min - value) % range
		: min + (value + min) % range;
}

/**
 * Wraps an integer between two values (use for indices)
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function wrapInteger(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min + 1;
    let normalized = (value - min) % range;
    if (normalized < 0) normalized += range;
    return min + normalized;
}

/**
 * Mirror wraps a number between two values (use for indices)
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function mirrorWrap(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	const range = (max - min);
	const period = range * 2;
	let normalized = (((value - min) % period) + period) % period;
	if(normalized >= range){
		normalized = period - normalized;
	}
	return min + normalized;
}

/**
 * Bounds a float value between min and max using specified out-of-bounds behavior
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @param {OobBehavior?} oobBehavior 
 * @returns 
 */
export function bound(value, min, max, oobBehavior){
	switch(oobBehavior){
		case "wrap": {
			return wrapFloat(value, min, max);
		}
		case "mirror": {
			return mirrorWrapFloat(value, min, max);
		}
		case "clamp":
		default: {
			return clamp(value, min, max);
		}
	}
}

/**
 * Bounds an int value between min and max using specified out-of-bounds behavior
 * This is different because space after the last value is included and the max is exclusive
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @param {OobBehavior?} oobBehavior 
 * @returns 
 */
export function boundInteger(value, min, max, oobBehavior){
	switch(oobBehavior){
		case "wrap": {
			return wrapInteger(value, min, max);
		}
		case "mirror": {
			return mirrorWrap(value, min, max);
		}
		case "clamp":
		default: {
			return clamp(value, min, max);
		}
	}
}

/**
 * gets the fractional part of floating point number
 * @param {number} value 
 * @returns 
 */
export function getFractionalPart(value) {
	return Math.abs(value % 1);
}