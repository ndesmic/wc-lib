import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { parseFloatArrayWithLengthOrDefault, parseArrayOfArraysOrDefault, parseBoolean, parseArrayOrDefault } from "./wc-utils.js";


describe("wc-utils", () => {
      describe("parseBoolean", () => {
        it("should get true for string value", () => {
            const result = parseBoolean("foo");
            expect(result).toEqual(true);
        });
        it("should get true for empty string value", () => {
            const result = parseBoolean("");
            expect(result).toEqual(true);
        });
        it("should get true for number value", () => {
            const result = parseBoolean(12);
            expect(result).toEqual(true);
        });
        it("should get true for 0 value", () => {
            const result = parseBoolean(0);
            expect(result).toEqual(true);
        });
        it("should get true for true", () => {
            const result = parseBoolean(true);
            expect(result).toEqual(true);
        });
        it("should get false for false value", () => {
            const result = parseBoolean(false);
            expect(result).toEqual(false);
        });
        it("should get false for null", () => {
            const result = parseBoolean(null);
            expect(result).toEqual(false);
        });
        it("should get false for undefined", () => {
            const result = parseBoolean(undefined);
            expect(result).toEqual(false);
        });
    });
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
    describe("parseArrayOrDefault", () => {
        it("should parse string value", () => {
            const result = parseArrayOrDefault("foo, bar, baz");
            expect(result).toEqual(["foo", "bar", "baz"]);
        });
        it("should parse array", () => {
            const result = parseArrayOrDefault(["foo", "bar", "baz"]);
            expect(result).toEqual(["foo", "bar", "baz"]);
        });
        it("should get null if empty", () => {
            const result = parseArrayOrDefault(undefined);
            expect(result).toEqual(null);
        });
    });
    describe("parseArrayOfArraysOrDefault", () => {
 it("should parse string value", () => {
        const result = parseArrayOfArraysOrDefault("foo, bar, baz;1,2,4;a,b, c");
            expect(result).toEqual([
                ["foo", "bar", "baz"],
                ["1", "2", "4"],
                ["a", "b", "c"]
            ]);
        });
        it("should parse array", () => {
            const result = parseArrayOfArraysOrDefault([
                ["foo", "bar", "baz"],
                ["1", "2", "3"],
                ["a", "b", "c"]
            ]);
            expect(result).toEqual([
                ["foo", "bar", "baz"],
                ["1", "2", "3"],
                ["a", "b", "c"]
            ]);
        });
        it("should get null if empty", () => {
            const result = parseArrayOfArraysOrDefault(undefined);
            expect(result).toEqual(null);
        });
    });
});