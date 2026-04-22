import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
	convoluteTensor,
	getBoundedValue,
	getBoundedIndices,
	sampleTensor,
    getDimensionalIndices,
    getFlatIndex,
	getValue,
	iterateTensor,
	getFlatMultiRange,
	getDimensionalMultiRange,
	isValidIndexForShape,
	toColumnMajor
} from "./tensor-utils.js";
import { multiTest } from "../test-tools.js";
import { OVERFLOW, UNDERFLOW } from "../math-utils.js";

describe("tensor-utils", () => {
	describe("isValidIndexForShape", () => {
		multiTest([
			{ args: [[0,0,0], [3,3,3]], expected: true },
			{ args: [[1,1,1], [3,3,3]], expected: true },
			{ args: [[2,2,2], [3,3,3]], expected: true },
			{ args: [[1,1,3], [3,3,3]], expected: false },
			{ args: [[1,3,1], [3,3,3]], expected: false },
			{ args: [[3,1,1], [3,3,3]], expected: false },
			{ args: [[1,1,-1], [3,3,3]], expected: false },
			{ args: [[1,-1,1], [3,3,3]], expected: false },
			{ args: [[-1,1,1], [3,3,3]], expected: false },
			{ args: [[1,1], [3,3,3]], expected: false },
			{ args: [[1], [3,3,3]], expected: false },
			{ args: [[1,1,1,1], [3,3,3]], expected: false },
		], ({ args, expected }) => {
			expect(isValidIndexForShape(...args)).toEqual(expected)
		})
	});
	describe("toColumnMajor", () => {
		it("should convert row major tensor to col major", () => {
			const tensor = {
				shape: [2,2,2],
				values: [
					1,2,
					3,4,

					5,6,
					7,8
				]
			};
			const result = toColumnMajor(tensor);
			expect(result).toEqual({
				shape: [2,2,2],
				values: [1,5,3,7,2,6,4,8]
			})
		});
	});
	// describe("getFlatIndex", () => {
    //     multiTest([
    //         { args: [[1,1,1],[3,3,3]], expected: 13 },
    //         { args: [[0, 0], [4, 3]], expected: 0 },
    //         { args: [[0, 3], [4, 3]], expected: 3 },
    //         { args: [[4, 3, 2], [5, 5, 5]], expected: 117 }
    //     ], ({ args, expected }) => {
    //         expect(getFlatIndex(...args)).toEqual(expected);
    //     });
	// });
	// describe("getDimensionalIndicies", () => {
    //     multiTest([
    //         { args: [13,[3,3,3]], expected: [1,1,1] },
    //         { args: [0, [4, 3]], expected: [0,0] },
    //         { args: [3, [4, 3]], expected: [3,0] },
    //         { args: [117, [5, 5, 5]], expected: [2,3,4] }
    //     ], ({ args, expected }) => {
    //         expect(getDimensionalIndices(...args)).toEqual(expected);
    //     });
	// });
    describe("getValue", () => {
        const tensor = toColumnMajor({
            shape: [2,2,2],
            values: [
				1,2,
				3,4, 
				
				5,6,
				7,8
			]
        });
        multiTest([
            { args: [tensor, [0,0,0]], expected: 1 },
            { args: [tensor, [0,0,1]], expected: 2 },
            { args: [tensor, [0,1,0]], expected: 3 },
            { args: [tensor, [0,1,1]], expected: 4 },
            { args: [tensor, [1,0,0]], expected: 5 },
            { args: [tensor, [1,0,1]], expected: 6 },
            { args: [tensor, [1,1,0]], expected: 7 },
            { args: [tensor, [1,1,1]], expected: 8 }
        ], ({ args, expected }) => {
            expect(getValue(...args)).toEqual(expected);
        });
    });
	describe("getBoundedIndices", () => {
		describe("for 2 dimensions", () => {
			const tensor = toColumnMajor({
				shape: [3, 3],
				values: [
					0,1,2,
					3,4,5,
					6,7,8,
				],
			});

			it("should get value out-of-range (report)", () => {
				expect(getBoundedIndices(tensor, [0, -1], { type: "report" })).toEqual([0, UNDERFLOW]);
				expect(getBoundedIndices(tensor, [-1, 0], { type: "report" })).toEqual([UNDERFLOW, 0]);
				expect(getBoundedIndices(tensor, [-1, -1], { type: "report" })).toEqual([UNDERFLOW, UNDERFLOW]);

				expect(getBoundedIndices(tensor, [0, 3], { type: "report" })).toEqual([0, OVERFLOW]);
				expect(getBoundedIndices(tensor, [-1, 2], { type: "report" })).toEqual([UNDERFLOW, 2]);
				expect(getBoundedIndices(tensor, [-1, 3], { type: "report" })).toEqual([UNDERFLOW, OVERFLOW]);

				expect(getBoundedIndices(tensor, [2, -1], { type: "report" })).toEqual([2, UNDERFLOW]);
				expect(getBoundedIndices(tensor, [3, 0], { type: "report" })).toEqual([OVERFLOW, 0]);
				expect(getBoundedIndices(tensor, [3, -1], { type: "report" })).toEqual([OVERFLOW, UNDERFLOW]);

				expect(getBoundedIndices(tensor, [2, 3], { type: "report" })).toEqual([2, OVERFLOW]);
				expect(getBoundedIndices(tensor, [3, 2], { type: "report" })).toEqual([OVERFLOW, 2]);
				expect(getBoundedIndices(tensor, [3, 3], { type: "report" })).toEqual([OVERFLOW, OVERFLOW]);
			});
			it("should get value out-of-range (constant)", () => {
				expect(getBoundedIndices(tensor, [0, -1], { type: "constant", value: 99 })).toEqual([0, 99]);
				expect(getBoundedIndices(tensor, [-1, 0], { type: "constant", value: 99 })).toEqual([99, 0]);
				expect(getBoundedIndices(tensor, [-1, -1], { type: "constant", value: 99 })).toEqual([99, 99]);

				expect(getBoundedIndices(tensor, [0, 3], { type: "constant", value: 99 })).toEqual([0, 99]);
				expect(getBoundedIndices(tensor, [-1, 2], { type: "constant", value: 99 })).toEqual([99, 2]);
				expect(getBoundedIndices(tensor, [-1, 3], { type: "constant", value: 99 })).toEqual([99, 99]);

				expect(getBoundedIndices(tensor, [2, -1], { type: "constant", value: 99 })).toEqual([2, 99]);
				expect(getBoundedIndices(tensor, [3, 0], { type: "constant", value: 99 })).toEqual([99, 0]);
				expect(getBoundedIndices(tensor, [3, -1], { type: "constant", value: 99 })).toEqual([99, 99]);

				expect(getBoundedIndices(tensor, [2, 3], { type: "constant", value: 99 })).toEqual([2, 99]);
				expect(getBoundedIndices(tensor, [3, 2], { type: "constant", value: 99 })).toEqual([99, 2]);
				expect(getBoundedIndices(tensor, [3, 3], { type: "constant", value: 99 })).toEqual([99, 99]);
			});
		});
	});
	describe("getBoundedValue", () => {
		describe("for 2 dimensions", () => {
			const imageData = toColumnMajor({
				shape: [3, 3],
				values: [
					0,1,2,
					3,4,5,
					6,7,8,
				],
			});

			it("should get value in range", () => {
				expect(getBoundedValue(imageData, [0, 0])).toEqual(0);
				expect(getBoundedValue(imageData, [0, 1])).toEqual(1);
				expect(getBoundedValue(imageData, [0, 2])).toEqual(2);

				expect(getBoundedValue(imageData, [1, 0])).toEqual(3);
				expect(getBoundedValue(imageData, [1, 1])).toEqual(4);
				expect(getBoundedValue(imageData, [1, 2])).toEqual(5);

				expect(getBoundedValue(imageData, [2, 0])).toEqual(6);
				expect(getBoundedValue(imageData, [2, 1])).toEqual(7);
				expect(getBoundedValue(imageData, [2, 2])).toEqual(8);
			});
			it("should get value out-of-range (clamped)", () => {
				expect(getBoundedValue(imageData, [0, -1], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, 0], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, -1], { type: "clamp" })).toEqual(0);

				expect(getBoundedValue(imageData, [0, 3], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, 2], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, 3], { type: "clamp" })).toEqual(2);

				expect(getBoundedValue(imageData, [2, -1], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [3, 0], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [3, -1], { type: "clamp" })).toEqual(6);

				expect(getBoundedValue(imageData, [2, 3], { type: "clamp" })).toEqual(8);
				expect(getBoundedValue(imageData, [3, 2], { type: "clamp" })).toEqual(8);
				expect(getBoundedValue(imageData, [3, 3], { type: "clamp" })).toEqual(8);
			});
			it("should get value out-of-range (wrapped)", () => {
				expect(getBoundedValue(imageData, [0, -1], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, 0], { type: "wrap" })).toEqual(6);
				expect(getBoundedValue(imageData, [-1, -1], { type: "wrap" })).toEqual(8);

				expect(getBoundedValue(imageData, [0, 3], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, 2], { type: "wrap" })).toEqual(8);
				expect(getBoundedValue(imageData, [-1, 3], { type: "wrap" })).toEqual(6);

				expect(getBoundedValue(imageData, [2, -1], { type: "wrap" })).toEqual(8);
				expect(getBoundedValue(imageData, [3, 0], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [3, -1], { type: "wrap" })).toEqual(2);

				expect(getBoundedValue(imageData, [2, 3], { type: "wrap" })).toEqual(6);
				expect(getBoundedValue(imageData, [3, 2], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [3, 3], { type: "wrap" })).toEqual(0);
			});
			it("should get value out-of-range (mirror)", () => {
				expect(getBoundedValue(imageData, [0, -1], { type: "mirror" })).toEqual(1);
				expect(getBoundedValue(imageData, [-1, 0], { type: "mirror" })).toEqual(3);
				expect(getBoundedValue(imageData, [-1, -1], { type: "mirror" })).toEqual(4);

				expect(getBoundedValue(imageData, [0, 3], { type: "mirror" })).toEqual(1);
				expect(getBoundedValue(imageData, [-1, 2], { type: "mirror" })).toEqual(5);
				expect(getBoundedValue(imageData, [-1, 3], { type: "mirror" })).toEqual(4);

				expect(getBoundedValue(imageData, [2, -1], { type: "mirror" })).toEqual(7);
				expect(getBoundedValue(imageData, [3, 0], { type: "mirror" })).toEqual(3);
				expect(getBoundedValue(imageData, [3, -1], { type: "mirror" })).toEqual(4);

				expect(getBoundedValue(imageData, [2, 3], { type: "mirror" })).toEqual(7);
				expect(getBoundedValue(imageData, [3, 2], { type: "mirror" })).toEqual(5);
				expect(getBoundedValue(imageData, [3, 3], { type: "mirror" })).toEqual(4);
			});
			it("should get value out-of-range (constant)", () => {
				expect(getBoundedValue(imageData, [0, -1], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [-1, 0], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [-1, -1], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);

				expect(getBoundedValue(imageData, [0, 3], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [-1, 2], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [-1, 3], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);

				expect(getBoundedValue(imageData, [2, -1], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [3, 0], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [3, -1], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);

				expect(getBoundedValue(imageData, [2, 3], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [3, 2], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
				expect(getBoundedValue(imageData, [3, 3], { type: "report" }, { type: "constant", value: 99 })).toEqual(99);
			});
		});
		describe("for 3 dimensions", () => {
			const imageData = toColumnMajor({
				shape: [3, 3, 3],
				values: [
					0,1,2,
					3,4,5,
					6,7,8,

					9,10,11,
					12,13,14,
					15,16,17,

					18,19,20,
					21,22,23,
					24,25,26,
				],
			});
			it("should get value in range", () => {
				expect(getBoundedValue(imageData, [0, 0, 0])).toEqual(0);
				expect(getBoundedValue(imageData, [0, 0, 1])).toEqual(1);
				expect(getBoundedValue(imageData, [0, 0, 2])).toEqual(2);
				expect(getBoundedValue(imageData, [0, 1, 0])).toEqual(3);
				expect(getBoundedValue(imageData, [0, 1, 1])).toEqual(4);
				expect(getBoundedValue(imageData, [0, 1, 2])).toEqual(5);
				expect(getBoundedValue(imageData, [0, 2, 0])).toEqual(6);
				expect(getBoundedValue(imageData, [0, 2, 1])).toEqual(7);
				expect(getBoundedValue(imageData, [0, 2, 2])).toEqual(8);
				expect(getBoundedValue(imageData, [1, 0, 0])).toEqual(9);
				expect(getBoundedValue(imageData, [1, 0, 1])).toEqual(10);
				expect(getBoundedValue(imageData, [1, 0, 2])).toEqual(11);
				expect(getBoundedValue(imageData, [1, 1, 0])).toEqual(12);
				expect(getBoundedValue(imageData, [1, 1, 1])).toEqual(13);
				expect(getBoundedValue(imageData, [1, 1, 2])).toEqual(14);
				expect(getBoundedValue(imageData, [1, 2, 0])).toEqual(15);
				expect(getBoundedValue(imageData, [1, 2, 1])).toEqual(16);
				expect(getBoundedValue(imageData, [1, 2, 2])).toEqual(17);
				expect(getBoundedValue(imageData, [2, 0, 0])).toEqual(18);
				expect(getBoundedValue(imageData, [2, 0, 1])).toEqual(19);
				expect(getBoundedValue(imageData, [2, 0, 2])).toEqual(20);
				expect(getBoundedValue(imageData, [2, 1, 0])).toEqual(21);
				expect(getBoundedValue(imageData, [2, 1, 1])).toEqual(22);
				expect(getBoundedValue(imageData, [2, 1, 2])).toEqual(23);
				expect(getBoundedValue(imageData, [2, 2, 0])).toEqual(24);
				expect(getBoundedValue(imageData, [2, 2, 1])).toEqual(25);
				expect(getBoundedValue(imageData, [2, 2, 2])).toEqual(26);
			});
			it("should get value out-of-range (clamped)", () => {
				expect(getBoundedValue(imageData, [0, 0, -1], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [0, -1, 0], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, 0, 0], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [0, -1, -1], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, -1, 0], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, -1, -1], { type: "clamp" })).toEqual(0);
				expect(getBoundedValue(imageData, [0, 0, 3], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [0, -1, 3], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, 0, 3], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, -1, 3], { type: "clamp" })).toEqual(2);
				expect(getBoundedValue(imageData, [0, 3, 0], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [0, 3, -1], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [-1, 3, 0], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [-1, 3, -1], { type: "clamp" })).toEqual(6);
				expect(getBoundedValue(imageData, [0, 3, 3], { type: "clamp" })).toEqual(8);
				expect(getBoundedValue(imageData, [-1, 3, 3], { type: "clamp" })).toEqual(8);
				expect(getBoundedValue(imageData, [3, 0, 0], { type: "clamp" })).toEqual(18);
				expect(getBoundedValue(imageData, [3, 0, -1], { type: "clamp" })).toEqual(18);
				expect(getBoundedValue(imageData, [3, -1, 0], { type: "clamp" })).toEqual(18);
				expect(getBoundedValue(imageData, [3, -1, -1], { type: "clamp" })).toEqual(18);
				expect(getBoundedValue(imageData, [3, 3, 0], { type: "clamp" })).toEqual(24);
				expect(getBoundedValue(imageData, [3, 3, -1], { type: "clamp" })).toEqual(24);
				expect(getBoundedValue(imageData, [3, 3, 3], { type: "clamp" })).toEqual(26);
			});
			it("should get value out-of-range (wrapped)", () => {
				expect(getBoundedValue(imageData, [0, 0, -1], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [0, -1, 0], { type: "wrap" })).toEqual(6);
				expect(getBoundedValue(imageData, [-1, 0, 0], { type: "wrap" })).toEqual(18);
				expect(getBoundedValue(imageData, [0, -1, -1], { type: "wrap" })).toEqual(8);
				expect(getBoundedValue(imageData, [-1, -1, 0], { type: "wrap" })).toEqual(24);
				expect(getBoundedValue(imageData, [-1, -1, -1], { type: "wrap" })).toEqual(26);
				expect(getBoundedValue(imageData, [0, 0, 3], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [0, -1, 3], { type: "wrap" })).toEqual(6);
				expect(getBoundedValue(imageData, [-1, 0, 3], { type: "wrap" })).toEqual(18);
				expect(getBoundedValue(imageData, [-1, -1, 3], { type: "wrap" })).toEqual(24);
				expect(getBoundedValue(imageData, [0, 3, 0], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [0, 3, -1], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [-1, 3, 0], { type: "wrap" })).toEqual(18);
				expect(getBoundedValue(imageData, [-1, 3, -1], { type: "wrap" })).toEqual(20);
				expect(getBoundedValue(imageData, [0, 3, 3], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [-1, 3, 3], { type: "wrap" })).toEqual(18);
				expect(getBoundedValue(imageData, [3, 0, 0], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [3, 0, -1], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [3, -1, 0], { type: "wrap" })).toEqual(6);
				expect(getBoundedValue(imageData, [3, -1, -1], { type: "wrap" })).toEqual(8);
				expect(getBoundedValue(imageData, [3, 3, 0], { type: "wrap" })).toEqual(0);
				expect(getBoundedValue(imageData, [3, 3, -1], { type: "wrap" })).toEqual(2);
				expect(getBoundedValue(imageData, [3, 3, 3], { type: "wrap" })).toEqual(0);
			});
			it("should get value out-of-range (mirror)", () => {
				expect(getBoundedValue(imageData, [0, 0, -1], { type: "mirror" })).toEqual(1);
				expect(getBoundedValue(imageData, [0, -1, 0], { type: "mirror" })).toEqual(3);
				expect(getBoundedValue(imageData, [-1, 0, 0], { type: "mirror" })).toEqual(9);
				expect(getBoundedValue(imageData, [0, -1, -1], { type: "mirror" })).toEqual(4);
				expect(getBoundedValue(imageData, [-1, -1, 0], { type: "mirror" })).toEqual(12);
				expect(getBoundedValue(imageData, [-1, -1, -1], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [0, 0, 3], { type: "mirror" })).toEqual(1);
				expect(getBoundedValue(imageData, [0, -1, 3], { type: "mirror" })).toEqual(4);
				expect(getBoundedValue(imageData, [-1, 0, 3], { type: "mirror" })).toEqual(10);
				expect(getBoundedValue(imageData, [-1, -1, 3], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [0, 3, 0], { type: "mirror" })).toEqual(3);
				expect(getBoundedValue(imageData, [0, 3, -1], { type: "mirror" })).toEqual(4);
				expect(getBoundedValue(imageData, [-1, 3, 0], { type: "mirror" })).toEqual(12);
				expect(getBoundedValue(imageData, [-1, 3, -1], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [0, 3, 3], { type: "mirror" })).toEqual(4);
				expect(getBoundedValue(imageData, [-1, 3, 3], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [3, 0, 0], { type: "mirror" })).toEqual(9);
				expect(getBoundedValue(imageData, [3, 0, -1], { type: "mirror" })).toEqual(10);
				expect(getBoundedValue(imageData, [3, -1, 0], { type: "mirror" })).toEqual(12);
				expect(getBoundedValue(imageData, [3, -1, -1], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [3, 3, 0], { type: "mirror" })).toEqual(12);
				expect(getBoundedValue(imageData, [3, 3, -1], { type: "mirror" })).toEqual(13);
				expect(getBoundedValue(imageData, [3, 3, 3], { type: "mirror" })).toEqual(13);
			});
		});
	});
	describe("sampleTensor", () => {
		const imageData = toColumnMajor({
			shape: [3, 3],
			values: [
				0,1,2,
				3,4,5,
				6,7,8,
			],
		});

		it(`should sample integer values`, () => {
			expect(sampleTensor(imageData, [0, 0], undefined)).toEqual(0);
			expect(sampleTensor(imageData, [0, 1], undefined)).toEqual(1);
			expect(sampleTensor(imageData, [0, 2], undefined)).toEqual(2);

			expect(sampleTensor(imageData, [1, 0], undefined)).toEqual(3);
			expect(sampleTensor(imageData, [1, 1], undefined)).toEqual(4);
			expect(sampleTensor(imageData, [1, 2], undefined)).toEqual(5);

			expect(sampleTensor(imageData, [2, 0], undefined)).toEqual(6);
			expect(sampleTensor(imageData, [2, 1], undefined)).toEqual(7);
			expect(sampleTensor(imageData, [2, 2], undefined)).toEqual(8);
		});
		it(`should sample float values`, () => {
			expect(sampleTensor(imageData, [0, 0.5], undefined)).toEqual(0.5);
			expect(sampleTensor(imageData, [1, 0.5], undefined)).toEqual(3.5);
			expect(sampleTensor(imageData, [0.5, 0], undefined)).toEqual(1.5);
			expect(sampleTensor(imageData, [0.5, 1], undefined)).toEqual(2.5);
			expect(sampleTensor(imageData, [0.5, 0.5], undefined)).toEqual(2);
		});
		it(`should sample outside and clamp`, () => {
			expect(sampleTensor(imageData, [0, -1], { type: "clamp" })).toEqual(0);
		});
		it(`should sample outside and wrap`, () => {
			expect(sampleTensor(imageData, [0, -1], { type: "wrap" })).toEqual(2);
		});
		it(`should sample outside and mirror`, () => {
			expect(sampleTensor(imageData, [0, -1], { type: "mirror" })).toEqual(1);
		});
		// it(`should sample out with constant value`, () => {
		// 	expect(sampleTensor(imageData, [0, -1], { type: "constant" })).toEqual(3);
		// });
	});
	// describe("iterateTensor", () => {
	// 	it("should iterate over a tensor (3d)", () => {
	// 		const tensor = toColumnMajor({
	// 			shape: [3,3,3],
	// 			values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]
	// 		});
	// 		const valuesVisited = [];
	// 		const dimensionalIndiciesVisited = [];
	// 		const flatIndiciesVisited = [];
	// 		iterateTensor(tensor, (value, d, f) => {
	// 			valuesVisited.push(value);
	// 			dimensionalIndiciesVisited.push(d);
	// 			flatIndiciesVisited.push(f);
	// 		});
	// 		expect(dimensionalIndiciesVisited).toEqual([
	// 			[0,0,0],
	// 			[0,0,1],
	// 			[0,0,2],
	// 			[0,1,0],
	// 			[0,1,1],
	// 			[0,1,2],
	// 			[0,2,0],
	// 			[0,2,1],
	// 			[0,2,2],
	// 			[1,0,0],
	// 			[1,0,1],
	// 			[1,0,2],
	// 			[1,1,0],
	// 			[1,1,1],
	// 			[1,1,2],
	// 			[1,2,0],
	// 			[1,2,1],
	// 			[1,2,2],
	// 			[2,0,0],
	// 			[2,0,1],
	// 			[2,0,2],
	// 			[2,1,0],
	// 			[2,1,1],
	// 			[2,1,2],
	// 			[2,2,0],
	// 			[2,2,1],
	// 			[2,2,2],
	// 		]);
	// 		expect(flatIndiciesVisited).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]);
	// 		expect(valuesVisited).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]);
	// 	});
	//	});
	describe("getFlatMultiRange", () => {
		it("should iterate over a tensor (2d)", () => {
			const range = getFlatMultiRange({
				shape: [5,3]
			});
		
			expect(range).toEqual([
				[0,0],
				[0,1],
				[0,2],
				[1,0],
				[1,1],
				[1,2],
				[2,0],
				[2,1],
				[2,2],
				[3,0],
				[3,1],
				[3,2],
				[4,0],
				[4,1],
				[4,2],
			]);
		});
		it("should iterate over a tensor (3d)", () => {
			const range = getFlatMultiRange({
				shape: [3,3,3]
			})
		
			expect(range).toEqual([
				[0,0,0],
				[0,0,1],
				[0,0,2],
				[0,1,0],
				[0,1,1],
				[0,1,2],
				[0,2,0],
				[0,2,1],
				[0,2,2],
				[1,0,0],
				[1,0,1],
				[1,0,2],
				[1,1,0],
				[1,1,1],
				[1,1,2],
				[1,2,0],
				[1,2,1],
				[1,2,2],
				[2,0,0],
				[2,0,1],
				[2,0,2],
				[2,1,0],
				[2,1,1],
				[2,1,2],
				[2,2,0],
				[2,2,1],
				[2,2,2],
			]);
		});
		it("should use start value", () => {
			const range = getFlatMultiRange({
				start: [1,1,1],
				shape: [3,3,3]
			})
		
			expect(range).toEqual([
				[1,1,1],
				[1,1,2],
				[1,2,0],
				[1,2,1],
				[1,2,2],
				[2,0,0],
				[2,0,1],
				[2,0,2],
				[2,1,0],
				[2,1,1],
				[2,1,2],
				[2,2,0],
				[2,2,1],
				[2,2,2]
			]);
		});
		it("should use end value", () => {
			const range = getDimensionalMultiRange({
				end: [1,1,1],
				shape: [3,3,3]
			});
		
			expect(range).toEqual([
				[0,0,0],
				[0,0,1],
				[0,1,0],
				[0,1,1],
				[1,0,0],
				[1,0,1],
				[1,1,0],
				[1,1,1]
			]);
		});
		it("should throw if start is not valid", () => {
			expect(() => {
				getFlatMultiRange({ start: [3,3,3], shape: [3,3,3] });
			}).toThrow("Start value 3,3,3 was not valid 3,3,3 (bounds are exclusive)")
		});
		it("should throw if end is not valid", () => {
			expect(() => {
				getFlatMultiRange({ end: [3,3,3], shape: [3,3,3] });
			}).toThrow("End value 3,3,3 was not valid 3,3,3 (bounds are exclusive)")
		});
	});
	describe("getDimensionalMultiRange", () => {
		it("should iterate over a tensor (2d)", () => {
			const range = getDimensionalMultiRange({
				shape: [5,3]
			});
		
			expect(range).toEqual([
				[0,0],
				[0,1],
				[0,2],
				[1,0],
				[1,1],
				[1,2],
				[2,0],
				[2,1],
				[2,2],
				[3,0],
				[3,1],
				[3,2],
				[4,0],
				[4,1],
				[4,2],
			]);
		});
		it("should iterate over a tensor (3d)", () => {
			const range = getDimensionalMultiRange({
				shape: [3,3,3]
			})
		
			expect(range).toEqual([
				[0,0,0],
				[0,0,1],
				[0,0,2],
				[0,1,0],
				[0,1,1],
				[0,1,2],
				[0,2,0],
				[0,2,1],
				[0,2,2],
				[1,0,0],
				[1,0,1],
				[1,0,2],
				[1,1,0],
				[1,1,1],
				[1,1,2],
				[1,2,0],
				[1,2,1],
				[1,2,2],
				[2,0,0],
				[2,0,1],
				[2,0,2],
				[2,1,0],
				[2,1,1],
				[2,1,2],
				[2,2,0],
				[2,2,1],
				[2,2,2],
			]);
		});
		it("should use start value", () => {
			const range = getDimensionalMultiRange({
				start: [1,1,1],
				shape: [3,3,3]
			})
		
			expect(range).toEqual([
				[1,1,1],
				[1,1,2],
				[1,2,1],
				[1,2,2],
				[2,1,1],
				[2,1,2],
				[2,2,1],
				[2,2,2]
			]);
		});
		it("should use end value", () => {
			const range = getDimensionalMultiRange({
				end: [1,1,1],
				shape: [3,3,3]
			});
		
			expect(range).toEqual([
				[0,0,0],
				[0,0,1],
				[0,1,0],
				[0,1,1],
				[1,0,0],
				[1,0,1],
				[1,1,0],
				[1,1,1]
			]);
		});
		it("should throw if start is not valid", () => {
			expect(() => {
				getDimensionalMultiRange({ start: [3,3,3], shape: [3,3,3] });
			}).toThrow("Start value 3,3,3 was not valid 3,3,3 (bounds are exclusive)")
		});
		it("should throw if end is not valid", () => {
			expect(() => {
				getDimensionalMultiRange({ end: [3,3,3], shape: [3,3,3] });
			}).toThrow("End value 3,3,3 was not valid 3,3,3 (bounds are exclusive)")
		});
	});

	// describe("convoluteTensor", () => {
	// 	// it("should error if kernel is higher dimension than image", () => {
	// 	// 	const tensorMiddleOne = {
	// 	// 		shape: [3, 3],
	// 	// 		values: [
	// 	// 			0,0,0,
	// 	// 			0,1,0,
	// 	// 			0,0,0,
	// 	// 		],
	// 	// 	};
	// 	// 	const kernel = {
	// 	// 		shape: [2,2,2],
	// 	// 		value: [
	// 	// 			1,1,
	// 	// 			1,1,
				
	// 	// 			1,1,
	// 	// 			1,1
	// 	// 		]
	// 	// 	}
	// 	// 	expect(() => convoluteTensor(tensorMiddleOne, kernel)).toThrow("Kernel must have fewer dimensions than image tensor");
	// 	// });
	// 	describe("should convolute 2d", () => {
	// 		const tensorMiddleOne = {
	// 			shape: [3, 3],
	// 			values: [
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 				1,
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 			],
	// 		};

	// 		const kernelCircleOnes = {
	// 			shape: [3, 3],
	// 			values: [
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				0,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 			],
	// 		};

	// 		const tensorTlBrOnes = {
	// 			shape: [3, 3],
	// 			values: [
	// 				1,
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 				0,
	// 				1,
	// 			],
	// 		};

	// 		const kernelAllOnes = {
	// 			shape: [3, 3],
	// 			values: [
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 				1,
	// 			],
	// 		};

	// 		multiTest([
	// 			// {
	// 			// 	name: "center convoluted with donut ones",
	// 			// 	args: [tensorMiddleOne, kernelCircleOnes, "omit"],
	// 			// 	expected: {
	// 			// 		shape: [3, 3],
	// 			// 		values: [
	// 			// 			1,
	// 			// 			1,
	// 			// 			1,
	// 			// 			1,
	// 			// 			0,
	// 			// 			1,
	// 			// 			1,
	// 			// 			1,
	// 			// 			1,
	// 			// 		],
	// 			// 	},
	// 			// },
	// 			// {
	// 			// 	name: "corners convoluted with all ones, ommited",
	// 			// 	args: [tensorTlBrOnes, kernelAllOnes, "omit"],
	// 			// 	expected: {
	// 			// 		shape: [3, 3],
	// 			// 		values: [
	// 			// 			1,
	// 			// 			1,
	// 			// 			0,
	// 			// 			1,
	// 			// 			2,
	// 			// 			1,
	// 			// 			0,
	// 			// 			1,
	// 			// 			1,
	// 			// 		],
	// 			// 	},
	// 			// },
	// 			// {
	// 			// 	name: "corner convoluted with all ones, clamped",
	// 			// 	args: [tensorTlBrOnes, kernelAllOnes, "clamp"],
	// 			// 	expected: {
	// 			// 		shape: [3, 3],
	// 			// 		values: [
	// 			// 			4,
	// 			// 			2,
	// 			// 			0,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			0,
	// 			// 			2,
	// 			// 			4,
	// 			// 		],
	// 			// 	},
	// 			// },
	// 			// {
	// 			// 	name: "corners convoluted with all ones, wrapped",
	// 			// 	args: [tensorTlBrOnes, kernelAllOnes, { type: "wrap" }],
	// 			// 	expected: {
	// 			// 		shape: [3, 3],
	// 			// 		values: [
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 			2,
	// 			// 		],
	// 			// 	},
	// 			// },
	// 			// {
	// 			// 	name: "corners convoluted with all ones, mirrored",
	// 			// 	args: [tensorTlBrOnes, kernelAllOnes, { type: "mirror" }],
	// 			// 	expected: {
	// 			// 		shape: [3, 3],
	// 			// 		values: [
	// 			// 			1,
	// 			// 			1,
	// 			// 			0,
	// 			// 			1,
	// 			// 			2,
	// 			// 			1,
	// 			// 			0,
	// 			// 			1,
	// 			// 			1,
	// 			// 		],
	// 			// 	},
	// 			// },
	// 			{
	// 				name: "corners convoluted with all ones, constant",
	// 				args: [tensorTlBrOnes, kernelAllOnes, 3],
	// 				expected: {
	// 					shape: [3, 3],
	// 					values: [
	// 						1,
	// 						1,
	// 						0,
	// 						1,
	// 						2,
	// 						1,
	// 						0,
	// 						1,
	// 						1,
	// 					],
	// 				},
	// 			},
	// 		], ({ args, expected }) => {
	// 			const result = convoluteTensor(...args);
	// 			expect(result).toEqual(expected);
	// 		});
	// 	});
	// });
});
