import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { meyersDiffBackward, meyersDiffForward, meyersDiffNaive, meyersDiffMiddleSnake, normalizeMeyersDiff, replaceCoalsceMeyersDiff } from "./meyers-diff.js";

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
	describe("meyerDiffNaive", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiffNaive(
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
			const result = meyersDiffNaive(
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
			const result = meyersDiffNaive(
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
		it("should get edits for beginning insert", () =>{
			expect(meyersDiffNaive("bc", "abc")).toEqual([
				{ type: "INSERT", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "KEEP", value: "c" },
			]);
		});
		it("should get edits for beginning delete", () => {
			expect(meyersDiffNaive("abc", "bc")).toEqual([
				{ type: "DELETE", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "KEEP", value: "c" },
			]);
		});
		it("should get edits for end insert", () =>{
			expect(meyersDiffNaive("ab", "abc")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "INSERT", value: "c" },
			]);
		});
		it("should get edits for end delete", () => {
			expect(meyersDiffNaive("abc", "ab")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
			]);
		});
		it("should delete run", () => {
			expect(meyersDiffNaive("abcdef", "abef")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "DELETE", value: "d" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should insert run", () => {
			expect(meyersDiffNaive("abef", "abcdef")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "INSERT", value: "c" },
				{ type: "INSERT", value: "d" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should replace a run", () => {
			const result = meyersDiffNaive("abcdef", "abXYef");
			expect(result).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "DELETE", value: "d" },
				{ type: "INSERT", value: "X" },
				{ type: "INSERT", value: "Y" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should work on example 1", () => {
			const result = meyersDiffNaive("123abc456", "123xyz456");
			expect(result).toEqual([
				{ type: "KEEP", value: "1" },
				{ type: "KEEP", value: "2" },
				{ type: "KEEP", value: "3" },
				{ type: "DELETE", value: "a" },
				{ type: "DELETE", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "x" },
				{ type: "INSERT", value: "y" },
				{ type: "INSERT", value: "z" },
				{ type: "KEEP", value: "4" },
				{ type: "KEEP", value: "5" },
				{ type: "KEEP", value: "6" },
			]);
		});
	});
	describe("meyerDiffMiddleSnake", () => {
		it("should get edits for 2 same strings", () => {
			const result = meyersDiffMiddleSnake(
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
			const result = meyersDiffMiddleSnake(
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
			const result = meyersDiffMiddleSnake(
				"abc",
				"xyz",
			);
			expect(result.length).toEqual(6);
		});
		it("should get edits for beginning insert", () =>{
			expect(meyersDiffMiddleSnake("bc", "abc")).toEqual([
				{ type: "INSERT", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "KEEP", value: "c" },
			]);
		});
		it("should get edits for beginning delete", () => {
			expect(meyersDiffMiddleSnake("abc", "bc")).toEqual([
				{ type: "DELETE", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "KEEP", value: "c" },
			]);
		});
		it("should get edits for end insert", () =>{
			expect(meyersDiffMiddleSnake("ab", "abc")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "INSERT", value: "c" },
			]);
		});
		it("should get edits for end delete", () => {
			expect(meyersDiffMiddleSnake("abc", "ab")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
			]);
		});
		it("should delete run", () => {
			expect(meyersDiffMiddleSnake("abcdef", "abef")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "DELETE", value: "d" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should insert run", () => {
			expect(meyersDiffMiddleSnake("abef", "abcdef")).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "INSERT", value: "c" },
				{ type: "INSERT", value: "d" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should replace a run", () => {
			const result = meyersDiffMiddleSnake("abcdef", "abXYef");
			expect(result).toEqual([
				{ type: "KEEP", value: "a" },
				{ type: "KEEP", value: "b" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "X" },
				{ type: "DELETE", value: "d" },
				{ type: "INSERT", value: "Y" },
				{ type: "KEEP", value: "e" },
				{ type: "KEEP", value: "f" },
			]);
		});
		it("should work on example 1", () => {
			const result = meyersDiffMiddleSnake("123abc456", "123xyz456");
			expect(result).toEqual([
				{ type: "KEEP", value: "1" },
				{ type: "KEEP", value: "2" },
				{ type: "KEEP", value: "3" },
				{ type: "DELETE", value: "a" },
				{ type: "INSERT", value: "x" },
				{ type: "DELETE", value: "b" },
				{ type: "INSERT", value: "y" },
				{ type: "DELETE", value: "c" },
				{ type: "INSERT", value: "z" },
				{ type: "KEEP", value: "4" },
				{ type: "KEEP", value: "5" },
				{ type: "KEEP", value: "6" },
			]);
		});
	});
	describe("normalizeMeyersDiff", () => {
		it("should coalesce runs of DELETE", () => {
			const result = normalizeMeyersDiff([
				{ type: "DELETE", value: "h"},
				{ type: "DELETE", value: "e"},
				{ type: "DELETE", value: "l"},
				{ type: "DELETE", value: "l"},
				{ type: "DELETE", value: "o"}
			]);
			expect(result).toEqual([
				{ type: "DELETE", value: "hello" }
			]);
		});
		it("should coalesce runs of INSERT", () => {
			const result = normalizeMeyersDiff([
				{ type: "INSERT", value: "h"},
				{ type: "INSERT", value: "e"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "o"}
			]);
			expect(result).toEqual([
				{ type: "INSERT", value: "hello" }
			]);
		});
		it("should coalesce runs of KEEP", () => {
			const result = normalizeMeyersDiff([
				{ type: "KEEP", value: "h"},
				{ type: "KEEP", value: "e"},
				{ type: "KEEP", value: "l"},
				{ type: "KEEP", value: "l"},
				{ type: "KEEP", value: "o"}
			]);
			expect(result).toEqual([
				{ type: "KEEP", value: "hello" }
			]);
		});
		it("should emit empty list for empty list", () => {
			const result = normalizeMeyersDiff([]);
			expect(result).toEqual([]);
		});
		it("should coalesce runs of INSERT and DELETE", () => {
			const result = normalizeMeyersDiff([
				{ type: "INSERT", value: "h"},
				{ type: "INSERT", value: "e"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "o"},
				{ type: "KEEP", value: " "},
				{ type: "DELETE", value: "w"},
				{ type: "DELETE", value: "o"},
				{ type: "DELETE", value: "r"},
				{ type: "DELETE", value: "l"},
				{ type: "DELETE", value: "d"},
			]);
			expect(result).toEqual([
				{ type: "INSERT", value: "hello" },
				{ type: "KEEP", value: " " },
				{ type: "DELETE", value: "world" },
			]);
		});
		it("should order DELETE then INSERT", () => {
			const result = normalizeMeyersDiff([
				{ type: "INSERT", value: "h"},
				{ type: "INSERT", value: "e"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "l"},
				{ type: "INSERT", value: "o"},
				{ type: "DELETE", value: "w"},
				{ type: "DELETE", value: "o"},
				{ type: "DELETE", value: "r"},
				{ type: "DELETE", value: "l"},
				{ type: "DELETE", value: "d"},
			]);
			expect(result).toEqual([
				{ type: "DELETE", value: "world" },
				{ type: "INSERT", value: "hello" }
			]);
		});
		it("should coalesce interleaved DELETE then INSERT", () => {
			const result = normalizeMeyersDiff([
				{ type: "INSERT", value: "h"},
				{ type: "DELETE", value: "w"},
				{ type: "INSERT", value: "e"},
				{ type: "DELETE", value: "o"},
				{ type: "INSERT", value: "l"},
				{ type: "DELETE", value: "r"},
				{ type: "INSERT", value: "l"},
				{ type: "DELETE", value: "l"},
				{ type: "INSERT", value: "o"},
				{ type: "DELETE", value: "d"},
			]);
			expect(result).toEqual([
				{ type: "DELETE", value: "world" },
				{ type: "INSERT", value: "hello" }
			]);
		});
	});
	describe("replaceCoalsceMeyersDif", () => {
		// it("should coalesce a DELETE/INSERT run", () => {
		// 	const result = replaceCoalsceMeyersDiff([
		// 		{ type: "DELETE", value: "hello" },
		// 		{ type: "INSERT", value: "world" }
		// 	]);
		// 	expect(result).toEqual([
		// 		{ type: "REPLACE", newValue: "world", oldValue: "hello"  }
		// 	]);
		// });
		// it("should coalesce a DELETE/INSERT run with extra insert", () => {
		// 	const result = replaceCoalsceMeyersDiff([
		// 		{ type: "DELETE", value: "hello" },
		// 		{ type: "INSERT", value: "world!" }
		// 	]);
		// 	expect(result).toEqual([
		// 		{ type: "REPLACE", newValue: "world", oldValue: "hello"  },
		// 		{ type: "INSERT", value: "!"  }
		// 	]);
		// });
		// it("should coalesce a DELETE/INSERT run with extra delete", () => {
		// 	const result = replaceCoalsceMeyersDiff([
		// 		{ type: "DELETE", value: "hello!" },
		// 		{ type: "INSERT", value: "world" }
		// 	]);
		// 	expect(result).toEqual([
		// 		{ type: "DELETE", value: "h"  },
		// 		{ type: "REPLACE", newValue: "world", oldValue: "ello!"  },
		// 	]);
		// });
		// it("should not modify INSERT/DELETE run", () => {
		// 	const result = replaceCoalsceMeyersDiff([
		// 		{ type: "INSERT", value: "hello" },
		// 		{ type: "DELETE", value: "world" }
		// 	]);
		// 	expect(result).toEqual([
		// 		{ type: "INSERT", value: "hello" },
		// 		{ type: "DELETE", value: "world" }
		// 	]);
		// });
		// it("should not modify INSERT run", () => {
		// 	const result = replaceCoalsceMeyersDiff([
		// 		{ type: "INSERT", value: "hello" },
		// 	]);
		// 	expect(result).toEqual([
		// 		{ type: "INSERT", value: "hello" },
		// 	]);
		// });
		it("should not modify DELETE run", () => {
			const result = replaceCoalsceMeyersDiff([
				{ type: "DELETE", value: "hello" },
			]);
			expect(result).toEqual([
				{ type: "DELETE", value: "hello" },
			]);
		});
		it("should not modify KEEP run", () => {
			const result = replaceCoalsceMeyersDiff([
				{ type: "KEEP", value: "hello" },
			]);
			expect(result).toEqual([
				{ type: "KEEP", value: "hello" },
			]);
		});
	});
});