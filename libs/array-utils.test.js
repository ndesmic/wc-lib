import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { padArrayEnd } from "./array-utils.js";

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
});