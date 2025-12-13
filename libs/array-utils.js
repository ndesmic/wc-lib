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