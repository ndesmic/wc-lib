export function padArrayStart(array, length, element) {
	let result = [...array];
	while (result.length < length) {
		result.unshift(element);
	}
	return result;
}
export function padArrayEnd(array, length, element) {
	let result = [...array];
	while (result.length < length) {
		result.push(element);
	}
	return result;
}

export function trimArrayStart(array, element = 0){
	const result = array.slice(0);
	while(result[0] === element){
		result.shift()
	}
	return result;
}

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

export function getRange({ start, end, step }) {
	let i = start ?? 0;
	step = step ?? 1;
	const result = [];
	for (; i <= end; i += step) {
		result.push(i);
	}
	return result;
}

export function getPermutations(items, size) {
	size ??= items.length;
	if (size > items.length) return [];
	if (size === 1) return items.map(x => [x]);
	return items.flatMap(x =>
		getPermutations(items.filter(v => x !== v), size - 1).map(item => [x, ...item]));
}
