import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getFractionalPart, lerp, clamp, wrap, mirrorWrap } from "./math-utils.js";

describe("math-utils", () => {
    describe("clamp", () => {
		[
			[[0.5, 0, 1], 0.5],
			[[-1, 0, 1], 0],
			[[2, 0, 1], 1],
		].forEach(test => it(`should get value ${test[1]} for min ${test[0][1]} and max ${test[0][2]} at value ${test[0][0]}`, () => {
			expect(clamp(test[0][0], test[0][1], test[0][2])).toEqual(test[1]);
		}))
	});
    describe("wrap", () => {
		[
			[[0.5, 0, 1], 0.5],
			[[-0.25, 0, 1], 0.75],
			[[1.25, 0, 1], 0.25],
		].forEach(test => it(`should get value ${test[1]} for min ${test[0][1]} and max ${test[0][2]} at value ${test[0][0]}`, () => {
			expect(wrap(test[0][0], test[0][1], test[0][2])).toEqual(test[1]);
		}))
	});
    describe("mirrorWrap", () => {
		[
			[[0.5, 0, 1], 0.5],
			[[-0.25, 0, 1], 0.25],
			[[1.25, 0, 1], 0.75],
		].forEach(test => it(`should get value ${test[1]} for min ${test[0][1]} and max ${test[0][2]} at value ${test[0][0]}`, () => {
			expect(mirrorWrap(test[0][0], test[0][1], test[0][2])).toEqual(test[1]);
		}))
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
		[
			[[0, 1, 0.5], 0.5],
			[[0, 2, 0.5], 1],
			[[-1, 1, 0.5], 0],
			[[0, 10, 0.75], 7.5]
		].forEach(test => it(`should get value ${test[1]} for start ${test[0][0]} and end ${test[0][1]} at value ${test[0][2]}`, () => {
			expect(lerp(test[0][0], test[0][1], test[0][2])).toEqual(test[1]);
		}))
	});
});