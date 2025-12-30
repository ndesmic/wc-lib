import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getPx, sample, setPx } from "./image-sample-utils.js";

describe("image-sample-utils", () => {
	const imageData = new ImageData(2, 2);
	setPx(imageData, 0, 0, [1, 0, 0, 1]);
	setPx(imageData, 1, 0, [0, 1, 0, 1]);
	setPx(imageData, 0, 1, [0, 0, 1, 1]);
	setPx(imageData, 1, 1, [1, 1, 0, 1]);

	describe("sample", () => {
		it(`should sample integer values`, () => {
			expect(sample(imageData, 0, 0, undefined)).toEqual([1, 0, 0, 1]);
			expect(sample(imageData, 1, 0, undefined)).toEqual([0, 1, 0, 1]);
			expect(sample(imageData, 0, 1, undefined)).toEqual([0, 0, 1, 1]);
			expect(sample(imageData, 1, 1, undefined)).toEqual([1, 1, 0, 1]);
		});
		it(`should sample float values`, () => {
			expect(sample(imageData, 0.5, 0, undefined)).toEqual([0.5, 0.5, 0, 1]);
			expect(sample(imageData, 0.5, 1, undefined)).toEqual([0.5, 0.5, 0.5, 1]);
			expect(sample(imageData, 0, 0.5, undefined)).toEqual([0.5, 0, 0.5, 1]);
			expect(sample(imageData, 1, 0.5, undefined)).toEqual([0.5, 1, 0.0, 1]);
			expect(sample(imageData, 0.5, 0.5, undefined)).toEqual([0.5, 0.5, 0.25, 1]);
		});
		//TODO End behavior
	});
	describe("getPx", () => {
		it("should get pixel value", () => {
			expect(getPx(imageData, 0, 0)).toEqual([1, 0, 0, 1]);
            expect(getPx(imageData, 1, 0)).toEqual([0, 1, 0, 1]);
            expect(getPx(imageData, 0, 1)).toEqual([0, 0, 1, 1]);
            expect(getPx(imageData, 1, 1)).toEqual([1, 1, 0, 1]);
		});
        it("should get pixel value (clamped)", () => {
			expect(getPx(imageData, -1, 0)).toEqual([1, 0, 0, 1]);
            expect(getPx(imageData, 2, 0)).toEqual([0, 1, 0, 1]);
            expect(getPx(imageData, 0, -1)).toEqual([1, 0, 0, 1]);
            expect(getPx(imageData, 0, 2)).toEqual([0, 0, 1, 1]);
		});
        //TODO End behavior
	});
});
