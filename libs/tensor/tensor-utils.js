//Tensors should be (channel, col, row)
/**
 * @typedef {import("../../types/sample.d.ts").OobBehavior} OobBehavior
 * @typedef {import("../../types/sample.d.ts").InvalidIndexValueMapping} InvalidIndexValueMapping
 * @typedef {import("../../types/tensor.d.ts").Tensor} Tensor
 * */
import { getFractionalPart, boundInteger, lerp, UNDERFLOW, OVERFLOW } from "../math-utils.js";
import { padArrayStart } from "../array-utils.js";

/**
 * Checks if indices are within shape bounds
 * @param {number[]} leftPackedIndices 
 * @param {number[]} leftPackedShape 
 * @returns 
 */
export function isValidDimensionalIndicesForShape(leftPackedIndices, leftPackedShape){
	if(leftPackedIndices.length != leftPackedShape.length) return false;
	if(leftPackedIndices.some((i, di) => i >= leftPackedShape[di])) return false;
	if(leftPackedIndices.some(i => i < 0)) return false;
	return true;
}

/**
 * 
 * @param {number} index 
 * @param {number[]} leftPackedShape 
 * @returns 
 */
export function isValidFlatIndexForShape(index, leftPackedShape){
	const maxIndex = leftPackedShape.reduce((prod, x) => prod * x) - 1; //index starts at 0
	if(index > maxIndex || index < 0){
		return false;
	}
	return true;
}

/**
 * Converts a tensor from row-major to column-major order (or vice versa)
 * @param {Tensor} tensor 
 * @returns {Tensor}
 */
export function toColumnMajor(tensor) {
    const newValues = new Array(tensor.values.length);
    
    iterateTensorLeftPacked(tensor, (value, dimensionalIndex, flatIndex) => {
        // Convert dimensional indices to column-major flat index
        let leftPackedIndex = 0;
        for (let i = 0; i < tensor.shape.length; i++) {
            leftPackedIndex *= tensor.shape[i];
            leftPackedIndex += dimensionalIndex[i];
        }
        newValues[leftPackedIndex] = value;
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
	if(start && !isValidDimensionalIndicesForShape(start, shape)){
		throw new Error(`Start value ${start} was not valid ${shape} (bounds are exclusive).`) 
	}
	if(end && !isValidDimensionalIndicesForShape(end, shape)){
		throw new Error(`End value ${end} was not valid ${shape} (bounds are exclusive).`) 
	}

	start = start ?? new Array(shape.length).fill(0);
	end = end ?? shape.map(x => x - 1);
	step = step ?? 1;

	const result = [];
	const currentValue = start.slice();

	function iterateInnerShape(dim){
		if(dim < 0){
			result.push(currentValue.slice());
			return
		}

		const low = start[dim];
		const high = end[dim];

		for(currentValue[dim] = low; currentValue[dim] <= high; currentValue[dim] ++){
			iterateInnerShape(dim - 1);
		}
	}

	iterateInnerShape(shape.length - 1);
	return result;
}

/**
 * Gets an array filled with tuples from `start` to `end` stepping by `step` using a flat interation strategy (wraps)
 * `start` and `end` are inclusive
 * @param {{ start?: number[], end: number[], step?: number}} param0 
 * @returns 
 */
export function getFlatMultiRange({ start, end, step, shape }){
	if(start && !isValidDimensionalIndicesForShape(start, shape)){
		throw new Error(`Start value ${start} was not valid ${shape} (bounds are exclusive).`) 
	}
	if(end && !isValidDimensionalIndicesForShape(end, shape)){
		throw new Error(`End value ${end} was not valid ${shape} (bounds are exclusive).`) 
	}

	start = start ?? new Array(shape.length).fill(0);
	end = end ?? shape.map(x => x - 1);
	step = step ?? 1;

	const flatStart = getFlatIndexleftPacked(start, shape);
	const flatEnd = getFlatIndexleftPacked(end, shape);
	const result = [];
	for(let i = flatStart; i <= flatEnd; i += step){
		result.push(getDimensionalIndicesleftPacked(i, shape));
	}
	return result;
}

/**
 * Gets the index into the values of a tensor given the dimensional indicies
 * @param {number[]} leftPackedIndices 
 * @param {number[]} leftPackedShape 
 * @returns {number}
 */
export function getFlatIndexleftPacked(leftPackedIndices, leftPackedShape) {
	if (!isValidDimensionalIndicesForShape(leftPackedIndices, leftPackedShape)){
		throw new Error(`Indices ${leftPackedIndices} were not valid for ${leftPackedShape} (bounds are exclusive).`);
	}

	let index = 0;
	for (let i = leftPackedShape.length - 1; i >= 0; i--) {
		index *= leftPackedShape[i];
		index += leftPackedIndices[i];
	}

	return index;
}

/**
 * Gets the dimensional indices of the tensor given the flat index into the values array
 * @param {number} flatIndex 
 * @param {number[]} leftPackedShape 
 * @returns {number[]}
 */
export function getDimensionalIndicesleftPacked(flatIndex, leftPackedShape) {
	if (!isValidFlatIndexForShape(flatIndex, leftPackedShape)){
		throw new Error(`Index ${flatIndex} was not valid for ${leftPackedShape} (bounds are exclusive).`);
	}

	const indices = new Array(leftPackedShape.length);
	for (let i = 0; i < leftPackedShape.length; i++) {
		indices[i] = (flatIndex % leftPackedShape[i]);
		flatIndex = Math.floor(flatIndex / leftPackedShape[i]);
	}
	return indices;
}

/**
 * Indexes into tensor at multi-index and returns value
 * @param {Tensor} tensor 
 * @param {number[]} leftPackedIndices 
 * @returns 
 */
export function getValue(tensor, leftPackedIndices){
	const index = getFlatIndexleftPacked(leftPackedIndices, tensor.shape);
	return tensor.values[index];
}

/**
 * Indexes into tensor at multi-index and sets value
 * @param {Tensor} tensor 
 * @param {number[]} leftPackedIndices 
 * @param {any} value 
 * @returns 
 */
export function setValue(tensor, leftPackedIndices, value){
	const index = getFlatIndexleftPacked(leftPackedIndices, tensor.shape);
	return tensor.values[index] = value;
}

/**
 * 
 * @param {Tensor} tensor 
 * @param {number[]} indices 
 * @param {OobBehavior} oobMapping 
 * @returns 
 */
export function getBoundedIndices(tensor, indices, oobMapping){
	return indices.map((i, di) => boundInteger(Math.floor(i), 0, tensor.shape[di] - 1, oobMapping));
}

/**
 * 
 * @param {Tensor} tensor 
 * @param {number[]} indices 
 * @param {OobBehavior} oobIndexMapping 
 * @param {InvalidIndexValueMapping} invalidIndexValueMap 
 * @returns 
 */
export function getBoundedValue(tensor, indices, oobIndexMapping = { type: "clamp" }, invalidIndexValueMap = { type: "none" }){
	const boundIndices = getBoundedIndices(tensor, indices, oobIndexMapping);
	if(invalidIndexValueMap?.type === "constant"){
		for(const index of boundIndices){
			if(index === UNDERFLOW || index === OVERFLOW){
				return invalidIndexValueMap.value;
			}
		}
	}
	const flatIndex = getFlatIndexleftPacked(boundIndices, tensor.shape);
    return tensor.values[flatIndex];
}

/**
 * Samples a pixel from ImageData using bounding behavior and multilinear filtering
 * todo: nearest neighbor option
 * @param {Tensor} imageData 
 * @param {number[]} index
 * @param {OobBehavior} oobBehavior 
 * @param {InvalidIndexValueMapping} invalidIndexValueMap 
 * @returns 
 */
export function sampleTensor(tensor, index, oobBehavior, invalidIndexValueMap = { type: "none" }) {
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
			const v0 = getBoundedValue(tensor, currentIndices, oobBehavior, invalidIndexValueMap);
			
			currentIndices[dim] = dimension[dim].endIndex;
			const v1 = getBoundedValue(tensor, currentIndices, oobBehavior, invalidIndexValueMap);

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

export function iterateTensorLeftPacked(tensor, callback){
	const dimensionalIndex = new Array(tensor.shape.length).fill(0);

	function iterateInnerShape(dim){
		if(dim < 0){
			const dIndex = dimensionalIndex.slice();
			const fIndex = getFlatIndexleftPacked(dIndex, tensor.shape);
			callback(tensor.values[fIndex], dIndex, fIndex);
			return;
		}

        for(dimensionalIndex[dim] = 0; dimensionalIndex[dim] < tensor.shape[dim]; dimensionalIndex[dim]++){
            iterateInnerShape(dim - 1);
        }
	}

	iterateInnerShape(tensor.shape.length - 1);
}

/**
 * Applies a convoltion kernel to image Tensor, left packed
 * TODO: add stride
 * TODO: add n-dimension
 * @param {Tensor} imageTensor
 * @param {Tensor} kernel 
 * @param {OobBehavior | "omit"}
 * @returns {Tensor}
 */
export function convoluteTensor(imageTensor, kernelTensor, oobBehavior = { type: "clamp" }, invalidIndexValueMap = { type: "none" }){
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

	iterateTensorLeftPacked(imageTensor, (value, dIndex, fIndex) => {
		let sum = 0;

		const [row, col] = dIndex;

		for (let kRow = 0; kRow < kernelTensor.shape[1]; kRow++) { //this will need to be updated for > 2 kernel dimensions
			const sampleRow = row + (-kRowMid + kRow);

			for (let kCol = 0; kCol < kernelTensor.shape[0]; kCol++) {
				const sampleCol = col + (-kColMid + kCol);
				const shouldOmit = [sampleRow, sampleCol].some((i, di) =>  ((i < 0 || i >= imageTensor.shape[di]) && normalizedOobBehavior[di] === "omit")); 
				if(shouldOmit) continue;
				
				const value = sampleTensor(imageTensor, [sampleRow, sampleCol], oobBehavior, invalidIndexValueMap);

				const kernelValue = kernelTensor.values[kRow * kernelTensor.shape[0] + kCol];
				sum += value * kernelValue;
			}
		}

		output.values[row * kernelTensor.shape[1] + col] = sum;
	});

	return output;
}