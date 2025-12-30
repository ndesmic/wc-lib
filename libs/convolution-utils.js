import { sample, setPx } from "./image-sample-utils.js";
/** @typedef {import("../types/tensor.d.ts").Tensor} Tensor */
/** @typedef {import("./image-sample-utils.js").OobBehavior} OobBehavior */

/**
 * Gets a gaussian blur kernel
 * @param {number} stdX 
 * @param {number} stdY 
 * @returns 
 */
export function getGaussianBlurKernel(stdX, stdY){
	if(stdX === 0 && stdY === 0){
		return {
			shape: [1,1],
			values: [1]
		};
	}
	const varX = stdX ** 2;
	const varY = stdY ** 2;
	const halfWidth = 3 * Math.ceil(stdX);
	const halfHeight = 3 * Math.ceil(stdY);

	const xSize = (halfWidth * 2) + 1;
	const ySize = (halfHeight * 2) + 1;
	const kernel = {
		values: new Array(xSize * ySize),
		shape: [xSize, ySize]
	};

	for (let row = 0; row < ySize; row++) {
		for (let col = 0; col < xSize; col++) {
			const i = (row * xSize) + col;

			const xCoeff = Math.exp((-((halfWidth - col) ** 2) / (2 * varX))) / Math.sqrt(2 * Math.PI * varX);
			const yCoeff = Math.exp((-((halfHeight - row) ** 2) / (2 * varY))) / Math.sqrt(2 * Math.PI * varY);
			const coeff = xCoeff * yCoeff;
			kernel.values[i] = coeff;
		}
	}

	//normalize to get rid of brightness artifacts
	const areaUnderCurve = kernel.values.reduce((sum, v) => sum + v);
	for(let i = 0; i < kernel.values.length; i++){
		kernel.values[i] /= areaUnderCurve;
	}

	return kernel;
}

/**
 * Get repeated box blur approximation of a gaussian blur kernel
 * @param {number} stdX 
 * @param {number} stdY 
 * @param {number} repetitions 
 * @returns 
 */
export function getGaussianBoxBlurKernels(stdX, stdY, repetitions = 3){
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
 * 
 * @param {number} stdX 
 * @param {number} stdY 
 */
export function getGaussianBlurSVGAlgorithmKernels(stdX, stdY){
	const width = get1DSVGAlgorithmKernelSizes(stdX);
	const height = get1DSVGAlgorithmKernelSizes(stdY);

}

function get1DSVGAlgorithmKernelSizes(std){
	const size = Math.floor(stdX * 3 * Math.sqrt(2 * Math.PI)/4, 0.5);
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

/**
 * Applies a convoltion kernel to ImageData
 * @param {ImageData} imageData
 * @param {Tensor} kernel 
 * @param {OobBehavior | "omit"}
 * @returns 
 */
export function convolute(imageData, kernel, oobBehavior){
	const output = new ImageData(imageData.width, imageData.height);
	const kRowMid = (kernel.shape[0] - 1) / 2;
	const kColMid = (kernel.shape[1] - 1) / 2;

	for (let row = 0; row < imageData.height; row++) {
		for (let col = 0; col < imageData.width; col++) {

			const sum = [0, 0, 0];
			for (let kRow = 0; kRow < kernel.shape[1]; kRow++) {
				for (let kCol = 0; kCol < kernel.shape[0]; kCol++) {
					const sampleRow = row + (-kRowMid + kRow);
					const sampleCol = col + (-kColMid + kCol);
					if (oobBehavior === "omit" && (sampleCol >= imageData.width || sampleCol < 0)) continue;
					if (oobBehavior === "omit" && (sampleRow >= imageData.height || sampleRow < 0)) continue;

					let color;
					if (Array.isArray(oobBehavior) && (sampleCol >= imageData.width || sampleCol < 0)) {
						color = oobBehavior.x;
					} else if (Array.isArray(oobBehavior) && (sampleRow >= imageData.height || sampleRow < 0)) {
						color = oobBehavior.y;
					} else {
						color = sample(imageData, sampleCol, sampleRow, oobBehavior);
					}

					const kernelValue = kernel.values[kRow * kernel.shape[0] + kCol];
					sum[0] += color[0] * kernelValue;
					sum[1] += color[1] * kernelValue;
					sum[2] += color[2] * kernelValue;
				}
			}

			setPx(output, col, row, [...sum, 1.0]);
		}
	}
	return output;
}