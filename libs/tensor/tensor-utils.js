//Tensors should be (channel, col, row) because that's better if processed by webgpu but right now they are mostly row-major
import { getFractionalPart, boundInteger, lerp } from "../math-utils.js";

/**
 * Gets the index into the values of a tensor given the dimensional indicies
 * @param {number[]} colMajorIndices 
 * @param {number[]} colMajorShape 
 * @returns {number}
 */
export function getFlatIndex(colMajorIndices, colMajorShape) {
	if (colMajorIndices.length != colMajorShape.length) throw new Error(`Indices count must match shape. indices length was ${colMajorIndices.length}, shape has length ${colMajorShape.length}.`);

	const rowMajorShape = colMajorShape;
	const rowMajorIndices = colMajorIndices;

	let index = 0;
	for (let i = 0; i < rowMajorShape.length; i++) {
		index *= rowMajorShape[i];
		index += rowMajorIndices[i];
	}

	return index;
}

/**
 * Gets the dimensional indices of the tensor given the flat index into the values array
 * @param {number} flatIndex 
 * @param {number[]} colMajorShape 
 * @returns {number[]}
 */
export function getDimensionalIndices(flatIndex, colMajorShape) {
	const indices = [];
	for (const size of colMajorShape) {
		indices.push(flatIndex % size);
		flatIndex = Math.floor(flatIndex / size);
	}
	return indices;
}

export function getValue(tensor, colMajorIndices){
	const index = getFlatIndex(colMajorIndices, tensor.shape);
	return tensor.values[index];
}

export function setValue(tensor, colMajorIndices, value){
	const index = getFlatIndex(colMajorIndices, tensor.shape);
	return tensor.values[index] = value;
}

//update for n-dimensions
export function getBoundedIndices(tensor, indices, oobBehavior){
	const boundedCol = boundInteger(Math.floor(indices[1]), 0, tensor.shape[1] - 1, oobBehavior);
    const boundedRow = boundInteger(Math.floor(indices[0]), 0, tensor.shape[0] - 1, oobBehavior);

    const offset = (boundedRow * tensor.shape[1]) + boundedCol;
    return tensor.values[offset];
}

/**
 * Samples a pixel from ImageData using bounding behavior and bilinear filtering (0-1 normalized)
 * todo: update for > 2 dimensions
 * @param {Tensor} imageData 
 * @param {number[]} index
 * @param {OobBehavior} oobBehavior 
 * @returns 
 */
export function sampleTensor(tensor, index, oobBehavior) {
    const columnStartIndex = Math.floor(index[1]);
    const columnEndIndex = Math.ceil(index[1]);
    const columnFraction = getFractionalPart(index[1]);

    const rowStartIndex = Math.floor(index[0]);
    const rowEndIndex = Math.ceil(index[0]);
    const rowFraction = getFractionalPart(index[0]);
	
    const rowStartColumnStartPx = getBoundedIndices(tensor, [rowStartIndex, columnStartIndex], oobBehavior); //oobBehavior;
    const rowEndColumnStartPx = getBoundedIndices(tensor, [rowEndIndex, columnStartIndex], oobBehavior); //oobBehavior;
    const rowStartColumnEndPx = getBoundedIndices(tensor, [rowStartIndex, columnEndIndex], oobBehavior); //oobBehavior;
    const rowEndColumnEndPx = getBoundedIndices(tensor, [rowEndIndex, columnEndIndex], oobBehavior); //oobBehavior;

    const rowStartPx = lerp(rowStartColumnStartPx, rowStartColumnEndPx, columnFraction);
    const rowEndPx = lerp(rowEndColumnStartPx, rowEndColumnEndPx, columnFraction);
    const finalPx = lerp(rowStartPx, rowEndPx, rowFraction);

    return finalPx;
}

/**
 * Applies a convoltion kernel to image Tensor,
 * row major, shape: slow -> fast iterating
 * TODO: add stride
 * TODO: add n-dimension
 * @param {Tensor} imageTensor
 * @param {Tensor} kernel 
 * @param {OobBehavior | "omit"}
 * @returns {Tensor}
 */
export function convoluteTensor(imageTensor, kernelTensor, oobBehavior = "clamp"){
	if(imageTensor.shape.length < kernelTensor.shape.length) throw new Error("Kernel must have fewer dimensions than image tensor");
	const output = { 
		shape: [...imageTensor.shape],
		values: new Array(imageTensor.values.length)  //this will need to be updated if there's a stride 
	};
	const kRowMid = (kernelTensor.shape[0] - 1) / 2;
	const kColMid = (kernelTensor.shape[1] - 1) / 2;

	for (let row = 0; row < imageTensor.shape[0]; row++) { //this will need to be updated for > 2 image dimensions
		for (let col = 0; col < imageTensor.shape[1]; col++) {

			let sum = 0;
			for (let kRow = 0; kRow < kernelTensor.shape[1]; kRow++) { //this will need to be updated for > 2 kernel dimensions
				const sampleRow = row + (-kRowMid + kRow);
				if (oobBehavior === "omit" && (sampleRow >= imageTensor.shape[0] || sampleRow < 0)) continue;

				for (let kCol = 0; kCol < kernelTensor.shape[0]; kCol++) {
					const sampleCol = col + (-kColMid + kCol);
					if (oobBehavior === "omit" && (sampleCol >= imageTensor.shape[1] || sampleCol < 0)) continue;
					

					let value;
					if (Array.isArray(oobBehavior) && (sampleCol >= imageTensor.shape[1] || sampleCol < 0)) { //this will need to be updated for < 2 dimensions
						value = oobBehavior[1];
					} else if (Array.isArray(oobBehavior) && (sampleRow >= imageTensor.shape[0] || sampleRow < 0)) {
						value = oobBehavior[0];
					} else {
						value = sampleTensor(imageTensor, [sampleRow, sampleCol], oobBehavior);
					}

					const kernelValue = kernelTensor.values[kRow * kernelTensor.shape[0] + kCol];
					sum += value * kernelValue;
				}
			}

            output.values[row * kernelTensor.shape[1] + col] = sum;
		}
	}
	return output;
}