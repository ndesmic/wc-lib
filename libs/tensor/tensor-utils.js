//Tensors should be (channel, col, row)
/**
 * @typedef {import("../../types/sample.d.ts").OobBehavior} OobBehavior
 * */
import { getFractionalPart, boundInteger, lerp, UNDERFLOW, OVERFLOW } from "../math-utils.js";
import { padArrayStart } from "../array-utils.js";

/**
 * Checks if indices are within shape bounds
 * @param {number[]} indices 
 * @param {number[]} shape 
 * @returns 
 */
export function isValidIndexForShape(indices, shape){
	if(indices.length != shape.length) return false;
	if(indices.some((i, di) => i >= shape[di])) return false;
	if(indices.some(i => i < 0)) return false;
	return true;
}	

/**
 * Converts a tensor from row-major to column-major order (or vice versa)
 * @param {Tensor} tensor 
 * @returns {Tensor}
 */
export function toColumnMajor(tensor) {
    const newValues = new Array(tensor.values.length);
    
    iterateTensor(tensor, (value, dimensionalIndex, flatIndex) => {
        // Convert dimensional indices to column-major flat index
        let colMajorIndex = 0;
        for (let i = 0; i < tensor.shape.length; i++) {
            colMajorIndex *= tensor.shape[i];
            colMajorIndex += dimensionalIndex[i];
        }
        newValues[colMajorIndex] = value;
    });
    
    return {
        shape: tensor.shape,
        values: newValues
    };
}

/**
 * Gets an array filled with tuples from `start` to `end` stepping by `step` using a dimensional interation strategy (no wrap)
 * `start` and `end` are inclusive
 * @param {{ start?: number[], end?: number[], step?: number}} param0 
 * @returns 
 */
export function getDimensionalMultiRange({ start, end, step, shape }){
	if(start && !isValidIndexForShape(start, shape)){
		throw new Error(`Start value ${start} was not valid ${shape} (bounds are exclusive).`) 
	}
	if(end && !isValidIndexForShape(end, shape)){
		throw new Error(`End value ${end} was not valid ${shape} (bounds are exclusive).`) 
	}

	start = start ?? new Array(shape.length).fill(0);
	end = end ?? shape.map(x => x - 1);
	step = step ?? 1;

	const result = [];
	const currentValue = start.slice();

	function iterateInnerShape(dim){
		if(dim === shape.length){
			result.push(currentValue.slice());
			return
		}

		const low = start[dim];
		const high = end[dim];

		for(currentValue[dim] = low; currentValue[dim] <= high; currentValue[dim]++){
			iterateInnerShape(dim + 1);
		}
	}

	iterateInnerShape(0);
	return result;
}

/**
 * Gets an array filled with tuples from `start` to `end` stepping by `step` using a flat interation strategy (wraps)
 * `start` and `end` are inclusive
 * @param {{ start?: number[], end: number[], step?: number}} param0 
 * @returns 
 */
export function getFlatMultiRange({ start, end, step, shape }){
	if(start && !isValidIndexForShape(start, shape)){
		throw new Error(`Start value ${start} was not valid ${shape} (bounds are exclusive).`) 
	}
	if(end && !isValidIndexForShape(end, shape)){
		throw new Error(`End value ${end} was not valid ${shape} (bounds are exclusive).`) 
	}

	start = start ?? new Array(shape.length).fill(0);
	end = end ?? shape.map(x => x - 1);
	step = step ?? 1;

	const flatStart = getFlatIndex(start, shape);
	const flatEnd = getFlatIndex(end, shape);
	const result = [];
	for(let i = flatStart; i <= flatEnd; i += step){
		result.push(getDimensionalIndices(i, shape));
	}
	return result;
}

/**
 * Gets the index into the values of a tensor given the dimensional indicies
 * @param {number[]} colMajorIndices 
 * @param {number[]} colMajorShape 
 * @returns {number}
 */
export function getFlatIndex(colMajorIndices, colMajorShape) {
	if (colMajorIndices.length != colMajorShape.length) throw new Error(`Indices count must match shape. indices length was ${colMajorIndices.length}, shape has length ${colMajorShape.length}.`);

	let index = 0;
	for (let i = colMajorShape.length - 1; i >= 0; i--) {
		index *= colMajorShape[i];
		index += colMajorIndices[i];
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
	const indices = new Array(colMajorShape.length);
	for (let i = colMajorShape.length - 1; i >= 0; i--) {
		indices[i] = (flatIndex % colMajorShape[i]);
		flatIndex = Math.floor(flatIndex / colMajorShape[i]);
	}
	return indices;
}

/**
 * Indexes into tensor at multi-index and returns value
 * @param {Tensor} tensor 
 * @param {number[]} colMajorIndices 
 * @returns 
 */
export function getValue(tensor, colMajorIndices){
	const index = getFlatIndex(colMajorIndices, tensor.shape);
	return tensor.values[index];
}

/**
 * Indexes into tensor at multi-index and sets value
 * @param {Tensor} tensor 
 * @param {number[]} colMajorIndices 
 * @param {any} value 
 * @returns 
 */
export function setValue(tensor, colMajorIndices, value){
	const index = getFlatIndex(colMajorIndices, tensor.shape);
	return tensor.values[index] = value;
}

export function getBoundedIndices(tensor, indices, oobMapping){
	return indices.map((i, di) => boundInteger(Math.floor(i), 0, tensor.shape[di] - 1, oobMapping));
}

export function getBoundedValue(tensor, indices, oobIndexMapping = { type: "clamp" }, invalidIndexValueMap){
	const boundIndices = getBoundedIndices(tensor, indices, oobIndexMapping);
	if(invalidIndexValueMap?.type === "constant"){
		for(const index of boundIndices){
			if(index === UNDERFLOW || index === OVERFLOW){
				return invalidIndexValueMap.value;
			}
		}
	}
	const flatIndex = getFlatIndex(boundIndices, tensor.shape);
    return tensor.values[flatIndex];
}

/**
 * Samples a pixel from ImageData using bounding behavior and multilinear filtering (0-1 normalized)
 * todo: update for > 2 dimensions
 * @param {Tensor} imageData 
 * @param {number[]} index
 * @param {OobBehavior} oobBehavior 
 * @returns 
 */
export function sampleTensor(tensor, index, oobBehavior) {
	const dimension = new Array(tensor.shape.length);

	for(let i = 0; i < tensor.shape.length; i++){
		const startIndex = Math.floor(index[i]); //todo: bound
		const endIndex = Math.ceil(index[i]); //todo: bound
		const fraction = getFractionalPart(index[i]);
		dimension[i] = { 
			startIndex,
			endIndex,
			fraction
		};
	}

	const currentIndices = new Array(tensor.shape.length);
	
	function recursiveLerp(dim){
		if(dim === tensor.shape.length - 1){
			currentIndices[dim] = dimension[dim].startIndex;
			const v0 = getBoundedValue(tensor, currentIndices, oobBehavior);
			
			currentIndices[dim] = dimension[dim].endIndex;
			const v1 = getBoundedValue(tensor, currentIndices, oobBehavior);

			const t = dimension[dim].fraction;

			return lerp(v0, v1, t);
		}

		currentIndices[dim] = dimension[dim].startIndex;
		const v0 = recursiveLerp(dim + 1);

		currentIndices[dim] = dimension[dim].endIndex;
		const v1 = recursiveLerp(dim + 1);

		const t = dimension[dim].fraction;

		return lerp(v0, v1, t);
	}

	return recursiveLerp(0);
}

export function iterateTensor(tensor, callback){
	const dimensionalIndex = new Array(tensor.shape.length).fill(0);

	function iterateInnerShape(dim){
		if(dim === tensor.shape.length){
			const dIndex = dimensionalIndex.slice();
			const fIndex = getFlatIndex(dIndex, tensor.shape);
			callback(tensor.values[fIndex], dIndex, fIndex);
			return;
		}

		for(dimensionalIndex[dim] = 0; dimensionalIndex[dim] < tensor.shape[dim]; dimensionalIndex[dim]++){
			iterateInnerShape(dim + 1);
		}
	}

	iterateInnerShape(0);
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
	const oob = Array.isArray(oobBehavior)
		? oobBehavior
		: new Array(imageTensor.shape.length).fill(oobBehavior);
	const normalizedOobBehavior = padArrayStart(oob, imageTensor.shape.length, "clamp");
	const output = { 
		shape: [...imageTensor.shape],
		values: new Array(imageTensor.values.length)  //this will need to be updated if there's a stride 
	};

	const kRowMid = (kernelTensor.shape[0] - 1) / 2;
	const kColMid = (kernelTensor.shape[1] - 1) / 2;

	iterateTensor(imageTensor, (value, dIndex, fIndex) => {
		let sum = 0;

		const [row, col] = dIndex;

		for (let kRow = 0; kRow < kernelTensor.shape[1]; kRow++) { //this will need to be updated for > 2 kernel dimensions
			const sampleRow = row + (-kRowMid + kRow);

			for (let kCol = 0; kCol < kernelTensor.shape[0]; kCol++) {
				const sampleCol = col + (-kColMid + kCol);
				const shouldOmit = [sampleRow, sampleCol].some((i, di) =>  ((i < 0 || i >= imageTensor.shape[di]) && normalizedOobBehavior[di] === "omit")); 
				if(shouldOmit) continue;
				
				const value = sampleTensor(imageTensor, [sampleRow, sampleCol], oobBehavior);

				const kernelValue = kernelTensor.values[kRow * kernelTensor.shape[0] + kCol];
				sum += value * kernelValue;
			}
		}

		output.values[row * kernelTensor.shape[1] + col] = sum;
	});

	return output;
}