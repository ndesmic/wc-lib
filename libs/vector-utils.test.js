import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { lerpVector } from "./vector-utils.js";

describe("vector-utils", () => {
    describe("lerp", () => {
        it("should lerp vectors", () => {
            const result = lerpVector([0,2,10], [4,10,70], 0.25);
            expect(result).toEqual([1,4,25])
        });
    });
})