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

export function areShapesEqual(shapeA, shapeB){
	if(shapeA.length !== shapeB.length) return false;
	for(let i = 0; i < shapeA.length; i++){
		if(shapeA[i] !== shapeB[i]){
			return false;
		}
	}
	return true;
}

/**
 * Converts a tensor from row-major to column-major order (or vice versa)
 * @param {Tensor} tensor 
 * @returns {Tensor}
 */
export function toLeftPacked(tensor) {
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

export function arrayToTensor(array){
	return { values: [...array], shape: [array.length] };
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

/**
 * Iterates the tensor in a left-packed order, if `false` is returned the iteration is ended early
 * @param {Tensor} tensor 
 * @param {(value: any, dimensionalIndices: number[], flatIndex: number) => void | false} callback 
 */
export function iterateTensorLeftPacked(tensor, callback){
	const dimensionalIndex = new Array(tensor.shape.length).fill(0);

	function iterateInnerShape(dim){
		if(dim < 0){
			const dIndex = dimensionalIndex.slice();
			const fIndex = getFlatIndexleftPacked(dIndex, tensor.shape);
			return callback(tensor.values[fIndex], dIndex, fIndex);
		}

        for(dimensionalIndex[dim] = 0; dimensionalIndex[dim] < tensor.shape[dim]; dimensionalIndex[dim]++){
            const retVal = iterateInnerShape(dim - 1);
			if(retVal === false){
				return false;
			}
        }
	}

	iterateInnerShape(tensor.shape.length - 1);
}

/**
 * 
 * @param {Tensor} tensor 
 * @param {(number, number[], number) => boolean} callback 
 * @returns 
 */
export function tensorContains(tensor, callback){
	let isFound = false;
	iterateTensorLeftPacked(tensor, (value, dIndex, fIndex) => {
		const result = callback(value, dIndex, fIndex);
		if(result){
			isFound = true;
			return false;
		}
	});
	return isFound;
}

/**
 * Adds two tensors
 * @param {Tensor} tensorA 
 * @param {Tensor} tensorB 
 * @returns 
 */
export function addTensor(tensorA, tensorB){
	if(!areShapesEqual(tensorA.shape, tensorB.shape)){
		throw new Error(`Shapes were not equal expected ${tensorA.shape} but found ${tensorB.shape}`);
	}
	const values = new Array(tensorA.values.length);
	for(let i = 0; i < tensorA.values.length; i++){
		values[i] = tensorA.values[i] + tensorB.values[i];
	}
	return { values, shape: [...tensorA.shape] };
}

/**
 * Adds two tensors
 * @param {Tensor} tensor 
 * @param {number} value
 * @returns 
 */
export function constantAddTensor(tensor, value){
	const values = new Array(tensor.values.length);
	for(let i = 0; i < tensor.values.length; i++){
		values[i] = tensor.values[i] + value;
	}
	return { values, shape: [...tensor.shape] };
}

/**
 * subtracts two tensors
 * @param {Tensor} tensorA 
 * @param {Tensor} tensorB 
 * @returns 
 */
export function subtractTensor(tensorA, tensorB){
	if(!areShapesEqual(tensorA.shape, tensorB.shape)){
		throw new Error(`Shapes were not equal expected ${tensorA.shape} but found ${tensorB.shape}`);
	}
	const values = new Array(tensorA.values.length);
	for(let i = 0; i < tensorA.values.length; i++){
		values[i] = tensorA.values[i] - tensorB.values[i];
	}
	return { values, shape: [...tensorA.shape] };
}

/**
 * subtract a constant from a tensor
 * @param {Tensor} tensor 
 * @param {number} value
 * @returns 
 */
export function constantSubtractTensor(tensor, value){
	const values = new Array(tensor.values.length);
	for(let i = 0; i < tensor.values.length; i++){
		values[i] = tensor.values[i] - value;
	}
	return { values, shape: [...tensor.shape] };
}

/**
 * element-wise multiplies two tensors
 * @param {Tensor} tensorA 
 * @param {Tensor} tensorB 
 * @returns 
 */
export function elementWiseMultiplyTensor(tensorA, tensorB){
	if(!areShapesEqual(tensorA.shape, tensorB.shape)){
		throw new Error(`Shapes were not equal expected ${tensorA.shape} but found ${tensorB.shape}`);
	}
	const values = new Array(tensorA.values.length);
	for(let i = 0; i < tensorA.values.length; i++){
		values[i] = tensorA.values[i] * tensorB.values[i];
	}
	return { values, shape: [...tensorA.shape] };
}

/**
 * element-wise multiplies a tensor with a constant value
 * @param {Tensor} tensor 
 * @param {number} multiplicand
 * @returns 
 */
export function constantMultiplyTensor(tensor, multiplicand){
	const values = new Array(tensor.values.length);
	for(let i = 0; i < tensor.values.length; i++){
		values[i] = tensor.values[i] * multiplicand;
	}
	return { values, shape: [...tensor.shape] };
}

/**
 * element-wise divides two tensors
 * @param {Tensor} tensorA 
 * @param {Tensor} tensorB 
 * @returns 
 */
export function elementWiseDivideTensor(tensorA, tensorB){
	if(!areShapesEqual(tensorA.shape, tensorB.shape)){
		throw new Error(`Shapes were not equal expected ${tensorA.shape} but found ${tensorB.shape}`);
	}
	const values = new Array(tensorA.values.length);
	for(let i = 0; i < tensorA.values.length; i++){
		values[i] = tensorA.values[i] / tensorB.values[i];
	}
	return { values, shape: [...tensorA.shape] };
}

/**
 * divides a tensor by a constant value
 * @param {Tensor} tensorA 
 * @param {number} denominator
 * @returns 
 */
export function constantDivideTensor(tensor, denominator){
	const values = new Array(tensor.values.length);
	for(let i = 0; i < tensor.values.length; i++){
		values[i] = tensor.values[i] / denominator;
	}
	return { values, shape: [...tensor.shape] };
}

/**
 * Negates a tensor
 * @param {Tensor} tensor 
 * @returns 
 */
export function negateTensor(tensor){
	const values = new Array(tensor.values.length);
	for(let i = 0; i < tensor.values.length; i++){
		values[i] = -tensor.values[i];
	}
	return { values, shape: [...tensor.shape] };
}

/**
 * Applies a convoltion kernel to image Tensor, left packed
 * TODO: add stride
 * TODO: tests for when kernel is smaller shape
 * @param {Tensor} imageTensor
 * @param {Tensor} kernel 
 * @param {OobBehavior | { type: "omit"}
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

	const kernelShape = arrayToTensor(kernelTensor.shape);
	const kernelMid = constantDivideTensor(constantSubtractTensor(kernelShape, 1), 2);

	iterateTensorLeftPacked(imageTensor, (value, dIndex, fIndex) => {
		let sum = 0;

		const tensorIndices = arrayToTensor(dIndex);

		iterateTensorLeftPacked(kernelTensor, (kValue, kdIndex, kfIndex) => { //this will need to be updated for > 2 kernel dimensions
			
			const kernelIndices = arrayToTensor(kdIndex);
			const sampleIndices = addTensor(tensorIndices, addTensor(negateTensor(kernelMid), kernelIndices))
			
			const shouldOmit = sampleIndices.values.some((i, di) =>  ((i < 0 || i >= imageTensor.shape[di]) && normalizedOobBehavior[di].type === "omit")); 
			if(shouldOmit) return;
				
			const value = sampleTensor(imageTensor, sampleIndices.values, oobBehavior, invalidIndexValueMap);
			const kernelValue = getValue(kernelTensor, kernelIndices.values);

			sum += value * kernelValue;
		});

		setValue(output, tensorIndices.values, sum);
	});

	return output;
}

//convolute stack