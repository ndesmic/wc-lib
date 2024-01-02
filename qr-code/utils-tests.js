import { chunkArray, trimArrayStart } from "./utils.js";

describe("chunkArray", () => {
	it("chunks array", () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(chunkArray(array, 3)).toEqual([
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
			[10]
		]);
	});
});

describe("trimArrayStart", () => {
	it("trims array start", () => {
		const array = [0, 0, 0, 4, 5, 6, 7, 8, 9, 10];
		expect(trimArrayStart(array)).toEqual([4,5,6,7,8,9,10]);
	});
});