import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getGradientPoint, hslToRgb, lerpColor, rgbToHsl } from "./color-utils.js";

describe("getHue", () => {
});
describe("rgbToHsl", () => {
	it("gets hsl for rgb", () => {
		const rgb1 = rgbToHsl([255, 0, 0]);
		expect(rgb1).toEqual([0, 100, 50]);

		const rgb2 = rgbToHsl([255, 255, 0]);
		expect(rgb2).toEqual([60, 100, 50]);

		const rgb3 = rgbToHsl([0, 255, 0]);
		expect(rgb3).toEqual([120, 100, 50]);

		const rgb4 = rgbToHsl([0, 255, 255]);
		expect(rgb4).toEqual([180, 100, 50]);

		const rgb5 = rgbToHsl([0, 0, 255]);
		expect(rgb5).toEqual([240, 100, 50]);

		const rgb6 = rgbToHsl([255, 0, 255]);
		expect(rgb6).toEqual([300, 100, 50]);
	});
});

describe("hslToRgb", () => {
	it("gets rgb for hsl", () => {
		const rgb1 = hslToRgb([0, 100, 50]);
		expect(rgb1).toEqual([255, 0, 0]);

		const rgb2 = hslToRgb([60, 100, 50]);
		expect(rgb2).toEqual([255, 255, 0]);

		const rgb3 = hslToRgb([120, 100, 50]);
		expect(rgb3).toEqual([0, 255, 0]);

		const rgb4 = hslToRgb([180, 100, 50]);
		expect(rgb4).toEqual([0, 255, 255]);

		const rgb5 = hslToRgb([240, 100, 50]);
		expect(rgb5).toEqual([0, 0, 255]);

		const rgb6 = hslToRgb([300, 100, 50]);
		expect(rgb6).toEqual([255, 0, 255]);
	});
});

describe("getGradientPoint", () => {
	it("should get color of gradient", () => {
		const result1 = getGradientPoint([0, 0, 0], [255, 255, 255], 0);
		const result2 = getGradientPoint([0, 0, 0], [255, 255, 255], 0.5);
		const result3 = getGradientPoint([0, 0, 0], [255, 255, 255], 1);

		expect(result1).toEqual([0, 0, 0]);
		expect(result2).toEqual([127.5, 127.5, 127.5]);
		expect(result3).toEqual([255, 255, 255]);

		const result4 = getGradientPoint([0, 0, 0], [255, 0, 0], 0);
		const result5 = getGradientPoint([0, 0, 0], [255, 0, 0], 0.5);
		const result6 = getGradientPoint([0, 0, 0], [255, 0, 0], 1);

		expect(result4).toEqual([0, 0, 0]);
		expect(result5).toEqual([127.5, 0, 0]);
		expect(result6).toEqual([255, 0, 0]);
	});
});

describe("lerpColor", () => {
	it("should find color at point (2 color)", () => {
		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
		], 0.5)).toEqual([0.5, 0.5, 0.0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
		], 0.75)).toEqual([0.25, 0.75, 0.0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
		], 0)).toEqual([1, 0.0, 0.0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
		], 1)).toEqual([0, 1, 0.0]);
	});
	it("should find color at point (3 color)", () => {
		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		], 0.5)).toEqual([0, 1, 0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		], 0.25)).toEqual([0.5, 0.5, 0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		], 0)).toEqual([1, 0, 0]);

		expect(lerpColor([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		], 1)).toEqual([0, 0, 1]);
	});
});
