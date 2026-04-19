import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getFractionalPart, lerp, clamp, wrapFloat, wrapInteger, mirrorWrap, boundInteger, boundFloat, inRangeOrDefault, inRangeOrReport, UNDERFLOW, OVERFLOW } from "./math-utils.js";
import { multiTest } from "./test-tools.js";

describe("math-utils", () => {
    describe("clamp", () => {
        multiTest([
            { args: [0.5, 0, 1], expected: 0.5, name: "should get value 0.5 for min 0 and max 1 at value 0.5" },
            { args: [-1, 0, 1], expected: 0, name: "should get value 0 for min 0 and max 1 at value -1" },
            { args: [2, 0, 1], expected: 1, name: "should get value 1 for min 0 and max 1 at value 2" },
        ], test => {
            expect(clamp(...test.args)).toEqual(test.expected);
        })
    });
    describe("wrapFloat", () => {
        multiTest([
            { args: [0.5, 0, 1], expected: 0.5 },
            { args: [-0.25, 0, 1], expected: 0.75 },
            { args: [1.25, 0, 1], expected: 0.25 },
            { args: [5, 0, 10], expected: 5 },
            { args: [-2, 0, 10], expected: 8 },
            { args: [12, 0, 10], expected: 2 },
        ], test => {
            expect(wrapFloat(...test.args)).toEqual(test.expected);
        })
    });
    describe("wrapInteger", () => {
        multiTest([
            { args: [5, 0, 10], expected: 5 },
            { args: [-2, 0, 10], expected: 9 },
            { args: [12, 0, 10], expected: 1 },
        ], test => {
            expect(wrapInteger(...test.args)).toEqual(test.expected);
        })
    });
    describe("mirrorWrap", () => {
        multiTest([
            { args: [0.5, 0, 1], expected: 0.5 },
            { args: [-0.25, 0, 1], expected: 0.25 },
            { args: [1.25, 0, 1], expected: 0.75 },
            { args: [5, 0, 10], expected: 5 },
            { args: [-2, 0, 10], expected: 2 },
            { args: [12, 0, 10], expected: 8 },
            { args: [15, 10, 20], expected: 15 },
            { args: [8, 10, 20], expected: 12 },
            { args: [22, 10, 20], expected: 18 },
        ], test => {
            expect(mirrorWrap(...test.args)).toEqual(test.expected);
        })
    });
    describe("inRangeOrDefault", () => {
        multiTest([
            { args: [5, 0, 10, 99], expected: 5 },
            { args: [-1, 0, 10, 99], expected: 99 },
            { args: [11, 0, 10, 99], expected: 99 },
        ], test => {
            expect(inRangeOrDefault(...test.args)).toEqual(test.expected);
        })
    });
    describe("inRangeOrReport", () => {
        multiTest([
            { args: [5, 0, 10, 99], expected: 5 },
            { args: [-1, 0, 10, 99], expected: UNDERFLOW },
            { args: [11, 0, 10, 99], expected: OVERFLOW },
        ], test => {
            expect(inRangeOrReport(...test.args)).toEqual(test.expected);
        })
    });
	describe("boundFloat", () => {
        multiTest([
            { args: [0.5, 0, 1.0, { type: "clamp" }], expected: 0.5 },
            { args: [-0.1, 0, 1.0, { type: "clamp" }], expected: 0 },
            { args: [1.1, 0, 1.0, { type: "clamp" }], expected: 1.0 },
            { args: [-0.1, 0, 1.0, { type: "wrap" }], expected: 0.9 },
            { args: [1.1, 0, 1.0, { type: "wrap" }], expected: 0.1 },
            { args: [-0.1, 0, 1.0, { type: "mirror" }], expected: 0.1 },
            { args: [1.1, 0, 1.0, { type: "mirror" }], expected: 0.9 },
            { args: [-0.1, 0, 1.0, { type: "constant", value: 99 }], expected: 99 },
            { args: [1.1, 0, 1.0, {type: "constant", value: 99}], expected: 99 },
        ], test => {
            expect(boundFloat(...test.args)).toBeCloseTo(test.expected);
        });
        multiTest([
            { args: [-0.1, 0, 1.0, { type: "report" }], expected: UNDERFLOW },
            { args: [1.1, 0, 1.0, {type: "report" }], expected: OVERFLOW },
        ], test => {
            expect(boundFloat(...test.args)).toEqual(test.expected);
        })
    });
	describe("boundInteger", () => {
        multiTest([
            { args: [5, 0, 10, { type: "clamp" }], expected: 5 },
            { args: [-1, 0, 10, { type: "clamp" }], expected: 0 },
            { args: [11, 0, 10, { type: "clamp" }], expected: 10 },
            { args: [-1, 0, 10, { type: "wrap" }], expected: 10 },
            { args: [11, 0, 10, { type: "wrap" }], expected: 0 },
            { args: [-1, 0, 10, { type: "mirror" }], expected: 1 },
            { args: [11, 0, 10, { type: "mirror" }], expected: 9 },
            { args: [-1, 0, 10, { type: "constant", value: 99 }], expected: 99 },
            { args: [11, 0, 10, { type: "constant", value: 99 }], expected: 99 }
        ], test => {
            expect(boundInteger(...test.args)).toEqual(test.expected);
        });
        multiTest([
            { args: [-1, 0, 1.0, { type: "report" }], expected: UNDERFLOW },
            { args: [11, 0, 1.0, { type: "report" }], expected: OVERFLOW },
        ], test => {
            expect(boundInteger(...test.args)).toEqual(test.expected);
        })
    });
    describe("getFractionalPart", () => {
        it("should get fractional part", () => {
            const result = getFractionalPart(1.11)
            expect(result).toBeCloseTo(0.11, 1e-7);
        });
        it("should get 0 if round", () => {
            const result = getFractionalPart(3)
            expect(result).toBe(0);
        });
    });
    describe("lerp", () => {
        multiTest([
            { args: [0, 1, 0.5], expected: 0.5 },
            { args: [0, 2, 0.5], expected: 1 },
            { args: [-1, 1, 0.5], expected: 0 },
            { args: [0, 10, 0.75], expected: 7.5 }
        ], test => {
            expect(lerp(...test.args)).toEqual(test.expected);
        })
    });
});