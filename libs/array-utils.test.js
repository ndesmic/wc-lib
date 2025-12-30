import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { padArrayEnd, chunkArray, trimArrayStart } from "./array-utils.js";

describe("array-utils", () => {
    describe("padArrayEnd", () => {
        it("should pad array that's too short", () => {
            const result = padArrayEnd([1,2,3], 5)
            expect(result).toEqual([1,2,3,0,0]);
        });
        it("should not pad array of length", () => {
            const result = padArrayEnd([1,2,3], 3)
            expect(result).toEqual([1,2,3]);
        });
        it("should not pad array that's too long", () => {
            const result = padArrayEnd([1,2,3,4,5], 3)
            expect(result).toEqual([1,2,3,4,5]);
        });
    });
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
});

