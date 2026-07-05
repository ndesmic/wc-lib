import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { meyersDiffBackward, meyersDiffForward, meyersDiff } from "./meyers-diff.js";
import { getMiddleSnake, meyersDiff2  } from "./meyers-diff2.js";

describe("meyers-diff", () => {
	describe("meyersDiffForward", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiffForward("foo", "foo");
			expect(result).toEqual([
				[-1, -1, -1, 3, 0, -1, -1],
			]);
		});
		it("should get edits for 2 different strings", () => {
			const result = meyersDiffForward("fcx", "fox");
			expect(result).toEqual([
				[-1, -1, -1, 1, 0, -1, -1],
				[-1, -1, 1, 1, 2, -1, -1],
				[-1, 1, 1, 3, 2, -1, -1],
			]);
		});
		it("should get edits for 2 completely different strings", () => {
			const result = meyersDiffForward("abc", "xyz");
			expect(result).toEqual([
				[-1, -1, -1, 0, 0, -1, -1],
				[-1, -1,  0, 0, 1, -1, -1],
				[-1,  0,  0, 1, 1,  2, -1],
				[ 0,  0,  1, 1, 2,  2,  3],
				[ 0,  1,  1, 2, 2,  3,  3],
				[ 1,  1,  2, 2, 3,  3,  4],
				[ 1,  2,  2, 3, 3,  3,  4]
			]);
		});
	});
	describe("meyersDiffBackward", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiffBackward(
				[
					[-1, -1, 0, 3, 0, -1, -1],
				],
				"foo",
				"foo",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "KEEP", value: "o" },
				{ type: "KEEP", value: "o" },
			]);
		});
		it("should get edits for 2 different strings", () => {
			const result = meyersDiffBackward(
				[
					[-1, -1, -1, 1, 0, -1, -1],
					[-1, -1, 1, 1, 2, -1, -1],
					[-1, 1, 1, 1, 2, -1, -1],
				],
				"fcx",
				"fox",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "o" },
				{ type: "KEEP", value: "x" },
			]);
		});
		it("should get edits for 2 completely different strings", () => {
			const result = meyersDiffBackward(
				[
					[-1, -1, -1, 0, 0, -1, -1],
					[-1, -1,  0, 0, 1, -1, -1],
					[-1,  0,  0, 1, 1,  2, -1],
					[ 0,  0,  1, 1, 2,  2,  3],
					[ 0,  1,  1, 2, 2,  3,  3],
					[ 1,  1,  2, 2, 3,  3,  4],
					[ 1,  2,  2, 3, 3,  3,  4]
				],
				"abc",
				"xyz",
			);
			expect(result).toEqual([
				{ type: "DELETE", value: "a" },
				{ type: "DELETE", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "x" },
				{ type: "INSERT", value: "y" },
				{ type: "INSERT", value: "z" },
			]);
		});
	});
	describe("meyerDiff", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiff(
				"foo",
				"foo",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "KEEP", value: "o" },
				{ type: "KEEP", value: "o" },
			]);
		});
		it("should get edits for 2 different strings", () => {
			const result = meyersDiff(
				"fcx",
				"fox",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "o" },
				{ type: "KEEP", value: "x" },
			]);
		});
		it("should get edits for 2 completely different strings", () => {
			const result = meyersDiff(
				"abc",
				"xyz",
			);
			expect(result).toEqual([
				{ type: "DELETE", value: "a" },
				{ type: "DELETE", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "x" },
				{ type: "INSERT", value: "y" },
				{ type: "INSERT", value: "z" },
			]);
		});
	});
});
describe("meyerDiff2", () => {
	// describe("getMiddleSnake", () => {
	// 	it("should get middle snake for sameword", () => {
	// 		const textA = "foo";
	// 		const textB = "foo";
	// 		const maxEdits = textA.length + textB.length;
	// 		const maxSize = (2 * maxEdits) + 1
	// 		const pathForward = new Int32Array(maxSize).fill(-1);
	// 		const pathBackward = new Int32Array(maxSize).fill(-1);
	// 		getMiddleSnake(0, 0, textA.length, textB.length, textA, textB, pathForward, pathBackward);
	// 	});
	// });
	describe("meyerDiff", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiff2(
				"foo",
				"foo",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "KEEP", value: "o" },
				{ type: "KEEP", value: "o" },
			]);
		});
		it("should get edits for 2 different strings", () => {
			const result = meyersDiff2(
				"fcx",
				"fox",
			);
			expect(result).toEqual([
				{ type: "KEEP", value: "f" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "o" },
				{ type: "KEEP", value: "x" },
			]);
		});
		it("should get edits for 2 completely different strings", () => {
			const result = meyersDiff2(
				"abc",
				"xyz",
			);
			expect(result).toEqual([
				{ type: "DELETE", value: "a" },
				{ type: "DELETE", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "x" },
				{ type: "INSERT", value: "y" },
				{ type: "INSERT", value: "z" },
			]);
		});
	});
});