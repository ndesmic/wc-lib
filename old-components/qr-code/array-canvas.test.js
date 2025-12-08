import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { ArrayCanvas } from "./array-canvas.js";

describe("ArrayCanvas", () => {
	it("should draw pixel (0,0)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(0, 0, 1);
		expect(canvas.data).toEqual([
			1, 0, 0, 
			0, 0, 0,
			0, 0, 0
		]);
	});
	it("should draw pixel (0,2)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(0, 2, 1);
		expect(canvas.data).toEqual([
			0, 0, 0,
			0, 0, 0,
			1, 0, 0
		]);
	});
	it("should draw pixel (2,0)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(2, 0, 1);
		expect(canvas.data).toEqual([
			0, 0, 1,
			0, 0, 0,
			0, 0, 0
		]);
	});
	it("should draw pixel (1,1)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(1, 1, 1);
		expect(canvas.data).toEqual([
			0, 0, 0,
			0, 1, 0,
			0, 0, 0
		]);
	});
	it("should draw pixel (0,-1)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(0, -1, 1);
		expect(canvas.data).toEqual([
			0, 0, 0,
			0, 0, 0,
			1, 0, 0
		]);
	});
	it("should draw pixel (-1,0)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(-1, 0, 1);
		expect(canvas.data).toEqual([
			0, 0, 1,
			0, 0, 0,
			0, 0, 0
		]);
	});
	it("should draw pixel (-3,0)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(-3, 0, 1);
		expect(canvas.data).toEqual([
			1, 0, 0,
			0, 0, 0,
			0, 0, 0
		]);
	});
	it("should draw pixel (0,-3)", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		canvas.drawPixel(0, -3, 1);
		expect(canvas.data).toEqual([
			1, 0, 0,
			0, 0, 0,
			0, 0, 0
		]);
	});
	it("should throw if x is OOB positive", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		expect(() => canvas.drawPixel(3, 0, 1)).toThrow();
	});
	it("should throw if x is OOB negative", () => {
		const canvas = new ArrayCanvas({ height: 3, width: 3 });
		expect(() => canvas.drawPixel(-4, 0, 1)).toThrow();
	});
	it("should print", () => {
		const canvas = new ArrayCanvas({ height: 5, width: 5 });
		canvas.drawPixel(0,0,1);
		canvas.drawPixel(-1,0,1);
		canvas.drawPixel(0,-1,1);
		expect(canvas.print()).toEqual(`1,0,0,0,1\n0,0,0,0,0\n0,0,0,0,0\n0,0,0,0,0\n1,0,0,0,0`);
	});
});