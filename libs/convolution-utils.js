/**
 * Get box blur kernels for stds that would yield even sized kernels
 * @param {number} stdX 
 * @param {number} stdY 
 * @param {number} repetitions 
 * @returns 
 */
export function getBoxBlurKernels(stdX, stdY, repetitions = 1){
	const xKernelSizes = get1DBoxBlurKernelSizes(stdX, repetitions);
    const yKernelSizes = get1DBoxBlurKernelSizes(stdY, repetitions);

	const kernels = new Array(repetitions);
	for(let i = 0; i < repetitions; i++){
		kernels[i] = {
			values: new Array(xKernelSizes[i] * yKernelSizes[i]),
			shape: [xKernelSizes[i], yKernelSizes[i]]
		};
		const value = 1 / (xKernelSizes[i] * yKernelSizes[i]);
		kernels[i].values.fill(value);
	}

	return kernels;
}

/**
 * Gets a 1d series of convolution kernel sizes to approximate gaussian blur from box blurs
 * @param {number} std 
 * @param {number} repetitions 
 * @returns 
 */
export function get1DBoxBlurKernelSizes(std, repetitions = 3){
	const sizeIdeal = Math.sqrt(((12 * std*std) / repetitions) + 1);
    const sizeLow = Math.floor(sizeIdeal);
	const sizeHigh = sizeLow + 1;

    const highPasses = Math.round(repetitions * (sizeIdeal - sizeLow) / (sizeHigh - sizeLow));
	const lowPasses = repetitions - highPasses;
	const passes = new Array(repetitions).fill(sizeHigh);
	for(let i = 0; i < lowPasses; i++){
		passes[i] = sizeLow;
	}
    return passes;
}