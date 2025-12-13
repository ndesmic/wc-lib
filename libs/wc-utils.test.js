import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { parseFloatArrayWithLengthOrDefault } from "./wc-utils.js";


describe("wc-utils", () => {
    describe("parseFloatArrayWithLengthOrDefault", () => {
        it("should parse string value", () => {
            const result = parseFloatArrayWithLengthOrDefault("1,2,3", 3);
            expect(result).toEqual([1,2,3]);
        });
        it("should parse string value that's too long", () => {
            const result = parseFloatArrayWithLengthOrDefault("1,2,3,4", 3);
            expect(result).toEqual([1,2,3]);
        });
        it("should parse string value that's too short", () => {
            const result = parseFloatArrayWithLengthOrDefault("1,2", 3);
            expect(result).toEqual([1,2,0]);
        });
        it("should parse array", () => {
            const result = parseFloatArrayWithLengthOrDefault([1,2,3], 3);
            expect(result).toEqual([1,2,3]);
        });
        it("should parse array that's too long", () => {
            const result = parseFloatArrayWithLengthOrDefault([1,2,3,4], 3);
            expect(result).toEqual([1,2,3]);
        });
        it("should parse array that's too short", () => {
            const result = parseFloatArrayWithLengthOrDefault([1,2], 3);
            expect(result).toEqual([1,2,0]);
        });
        it("should get default if no value", () => {
            const result = parseFloatArrayWithLengthOrDefault("", 3, [2,2,2]);
            expect(result).toEqual([2,2,2]);
        });
    });
});