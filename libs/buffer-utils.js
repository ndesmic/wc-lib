export function concatUint8Arrays(...arrays) {
    const length = arrays.reduce((sum,x) => sum + x.length, 0);
	const c = new Uint8Array(length);
    let index = 0;

    for(const array of arrays){
	    c.set(array, index);
	    index += array.length;
    }

	return c;
}