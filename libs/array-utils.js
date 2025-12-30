/**
 * 
 * @param {Array} array 
 * @param {number} length 
 * @param {any} element 
 * @returns 
 */
export function padArrayStart(array, length, element = 0) {
	const result = [...array];
	while (result.length < length) {
		result.unshift(element);
	}
	return result;
}

/**
 * 
 * @param {Array} array 
 * @param {number} length 
 * @param {any} element 
 * @returns 
 */
export function padArrayEnd(array, length, element = 0) {
	const result = [...array];
	while (result.length < length) {
		result.push(element);
	}
	return result;
}

export function getValuesFromEntriesRecursive(entries){
	return entries.map(keyval => {
		if(!Array.isArray(keyval)){
			return keyval;
		}
		if(Array.isArray(keyval[1])){
			return getValuesFromEntriesRecursive(keyval[1]);
		}
		return keyval[1];
	});
}

/**
 * 
 * @param {T | T[]} val 
 * @returns 
 */
export function getSingleOrArray(val){
	if(Array.isArray(val)){
		return val;
	}
	return [val];
}

/**
 * Removes matching element from start of array
 * @param {Array<any>} array 
 * @param {any} element 
 * @returns 
 */
export function trimArrayStart(array, element = 0){
	const result = array.slice(0);
	while(result[0] === element){
		result.shift()
	}
	return result;
}

/**
 * Divides array into an array of subarrays with length equal to lengthPerChunk
 * @param {Array<any>} array 
 * @param {number} lengthPerChunk 
 * @returns 
 */
export function chunkArray(array, lengthPerChunk) {
	const result = [];
	let chunk = [array[0]];
	for (let i = 1; i < array.length; i++) {
		if (i % lengthPerChunk === 0) {
			result.push(chunk);
			chunk = [];
		}
		chunk.push(array[i]);
	}
	if (chunk.length > 0) result.push(chunk);
	return result;
}

/**
 * Gets an array filled with numbers from `start` to `end` stepping by `step`
 * @param {{ start?: number, end?: number, step?: number}} param0 
 * @returns 
 */
export function getRange({ start, end, step }) {
	let i = start ?? 0;
	step = step ?? 1;
	const result = [];
	for (; i <= end; i += step) {
		result.push(i);
	}
	return result;
}

/**
 * Gets a list of all permutations of the elements in the array of length `length`.  By default considers all.
 * @param {Array} items 
 * @param {number} size 
 * @returns 
 */
export function getPermutations(items, size) {
	size ??= items.length;
	if (size > items.length) return [];
	if (size === 1) return items.map(x => [x]);
	return items.flatMap(x =>
		getPermutations(items.filter(v => x !== v), size - 1).map(item => [x, ...item]));
}