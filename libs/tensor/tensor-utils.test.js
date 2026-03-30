import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { convoluteTensor, getBoundedIndices, sampleTensor } from "./tensor-utils.js";
import { multiTest } from "../test-tools.js";
     
describe("tensor utils", () => {
    describe("getBoundedIndex", () => {
        const imageData = {
            shape: [3,3],
            values: [
                0, 1, 2,
                3, 4, 5,
                6, 7, 8
            ]
        };
        
        it("should get value", () => {
            expect(getBoundedIndices(imageData, [0, 0])).toEqual(0);
            expect(getBoundedIndices(imageData, [0, 1])).toEqual(1);
            expect(getBoundedIndices(imageData, [0, 2])).toEqual(2);

            expect(getBoundedIndices(imageData, [1, 0])).toEqual(3);
            expect(getBoundedIndices(imageData, [1, 1])).toEqual(4);
            expect(getBoundedIndices(imageData, [1, 2])).toEqual(5);

            expect(getBoundedIndices(imageData, [2, 0])).toEqual(6);
            expect(getBoundedIndices(imageData, [2, 1])).toEqual(7);
            expect(getBoundedIndices(imageData, [2, 2])).toEqual(8);
        });
        it("should get pixel value (clamped)", () => {
            expect(getBoundedIndices(imageData, [0, -1], "clamp")).toEqual(0);
            expect(getBoundedIndices(imageData, [-1, 0], "clamp")).toEqual(0);
            expect(getBoundedIndices(imageData, [-1, -1], "clamp")).toEqual(0);

            expect(getBoundedIndices(imageData, [0, 3], "clamp")).toEqual(2);
            expect(getBoundedIndices(imageData, [-1, 2], "clamp")).toEqual(2);
            expect(getBoundedIndices(imageData, [-1, 3], "clamp")).toEqual(2);

            expect(getBoundedIndices(imageData, [2, -1], "clamp")).toEqual(6);
            expect(getBoundedIndices(imageData, [3, 0], "clamp")).toEqual(6);
            expect(getBoundedIndices(imageData, [3, -1], "clamp")).toEqual(6);

            expect(getBoundedIndices(imageData, [2, 3], "clamp")).toEqual(8);
            expect(getBoundedIndices(imageData, [3, 2], "clamp")).toEqual(8);
            expect(getBoundedIndices(imageData, [3, 3], "clamp")).toEqual(8);
        });
        it("should get pixel value (wrapped)", () => {
            expect(getBoundedIndices(imageData, [0, -1], "wrap")).toEqual(2);
            expect(getBoundedIndices(imageData, [-1, 0], "wrap")).toEqual(6);
            expect(getBoundedIndices(imageData, [-1, -1], "wrap")).toEqual(8);

            expect(getBoundedIndices(imageData, [0, 3], "wrap")).toEqual(0);
            expect(getBoundedIndices(imageData, [-1, 2], "wrap")).toEqual(8);
            expect(getBoundedIndices(imageData, [-1, 3], "wrap")).toEqual(6);

            expect(getBoundedIndices(imageData, [2, -1], "wrap")).toEqual(8);
            expect(getBoundedIndices(imageData, [3, 0], "wrap")).toEqual(0);
            expect(getBoundedIndices(imageData, [3, -1], "wrap")).toEqual(2);

            expect(getBoundedIndices(imageData, [2, 3], "wrap")).toEqual(6);
            expect(getBoundedIndices(imageData, [3, 2], "wrap")).toEqual(2);
            expect(getBoundedIndices(imageData, [3, 3], "wrap")).toEqual(0);
        });
        it("should get pixel value (mirror)", () => {
            expect(getBoundedIndices(imageData, [0, -1], "mirror")).toEqual(1);
            expect(getBoundedIndices(imageData, [-1, 0], "mirror")).toEqual(3);
            expect(getBoundedIndices(imageData, [-1, -1], "mirror")).toEqual(4);

            expect(getBoundedIndices(imageData, [0, 3], "mirror")).toEqual(1);
            expect(getBoundedIndices(imageData, [-1, 2], "mirror")).toEqual(5);
            expect(getBoundedIndices(imageData, [-1, 3], "mirror")).toEqual(4);

            expect(getBoundedIndices(imageData, [2, -1], "mirror")).toEqual(7);
            expect(getBoundedIndices(imageData, [3, 0], "mirror")).toEqual(3);
            expect(getBoundedIndices(imageData, [3, -1], "mirror")).toEqual(4);

            expect(getBoundedIndices(imageData, [2, 3], "mirror")).toEqual(7);
            expect(getBoundedIndices(imageData, [3, 2], "mirror")).toEqual(5);
            expect(getBoundedIndices(imageData, [3, 3], "mirror")).toEqual(4);
        });
    });
    describe("sampleTensor", () => {
        const imageData = {
            shape: [3,3],
            values: [
                0, 1, 2,
                3, 4, 5,
                6, 7, 8
            ]
        };

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
            expect(sampleTensor(imageData, [0, -1], "clamp")).toEqual(0);
        });
        it(`should sample outside and wrap`, () => {
            expect(sampleTensor(imageData, [0, -1], "wrap")).toEqual(2);
        });
        it(`should sample outside and mirror`, () => {
            expect(sampleTensor(imageData, [0, -1], "mirror")).toEqual(1);
        });
    });
    describe("convoluteTensor", () => {
        describe("should convolute 2d", () => {
            const tensorMiddleOne = {
                shape: [3,3],
                values: [
                    0,0,0,
                    0,1,0,
                    0,0,0
                ]
            };

            const kernelCircleOnes = {
                shape: [3,3], 
                values: [
                    1,1,1,
                    1,0,1,
                    1,1,1
                ]
            };
            
            const tensorTlBrOnes = {
                shape: [3,3],
                values: [
                    1,0,0,
                    0,0,0,
                    0,0,1
                ]
            };

            const kernelAllOnes = {
                shape: [3,3], 
                values: [
                    1,1,1,
                    1,1,1,
                    1,1,1
                ]
            };

            multiTest([
                { 
                    args: [tensorMiddleOne, kernelCircleOnes, "omit"], 
                    expected: { 
                        shape: [3,3], values: [
                            1,1,1,
                            1,0,1,
                            1,1,1
                        ]
                    },
                },
                { 
                    args: [tensorTlBrOnes, kernelAllOnes, "omit"], 
                    expected: { 
                        shape: [3,3], values: [
                            1,1,0,
                            1,2,1,
                            0,1,1
                        ]
                    },
                },
                {
                    args: [tensorTlBrOnes, kernelAllOnes, "clamp"], 
                    expected: { 
                        shape: [3,3], values: [
                            4,2,0,
                            2,2,2,
                            0,2,4
                        ]
                    }
                },
                {
                    args: [tensorTlBrOnes, kernelAllOnes, "wrap"], 
                    expected: { 
                        shape: [3,3], values: [
                            2,2,2,
                            2,2,2,
                            2,2,2
                        ]
                    }
                },
                {
                    args: [tensorTlBrOnes, kernelAllOnes, "mirror"], 
                    expected: { 
                        shape: [3,3], values: [
                            1,1,0,
                            1,2,1,
                            0,1,1
                        ]
                    }
                }
            ], ({ args, expected}) => {
                const result = convoluteTensor(...args);
                expect(result).toEqual(expected);
            });
        });
    });
});