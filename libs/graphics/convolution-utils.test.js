import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getPx, setPx } from "../graphics/image-sample-utils.js";
import { convoluteImage } from "./convolution-utils.js";

describe("convolution-utils", () => {
    describe("convoluteImage", () => {
        it("should convolute 1", () => {
            const imageTestData = new ImageData(3, 3);
            setPx(imageTestData, 0, 0, [0, 0, 0, 1]);
            setPx(imageTestData, 1, 0, [0, 0, 0, 1]);
            setPx(imageTestData, 2, 0, [0, 0, 0, 1]);
            setPx(imageTestData, 0, 1, [0, 0, 0, 1]);
            setPx(imageTestData, 1, 1, [1, 1, 1, 1]);
            setPx(imageTestData, 2, 1, [0, 0, 0, 1]);
            setPx(imageTestData, 0, 2, [0, 0, 0, 1]);
            setPx(imageTestData, 1, 2, [0, 0, 0, 1]);
            setPx(imageTestData, 2, 2, [0, 0, 0, 1]);

            const kernel = {
                shape: [3,3], 
                values: [
                    1,1,1,
                    1,0,1,
                    1,1,1
                ]
            };
            
            const result = convoluteImage(imageTestData, kernel);

            expect(result.height).toEqual(3);
            expect(result.width).toEqual(3);
            expect(getPx(result, 0, 0)).toEqual([1,1,1,1]);
            expect(getPx(result, 1, 0)).toEqual([1,1,1,1]);
            expect(getPx(result, 2, 0)).toEqual([1,1,1,1]);
            expect(getPx(result, 0, 1)).toEqual([1,1,1,1]);
            expect(getPx(result, 1, 1)).toEqual([0,0,0,1]);
            expect(getPx(result, 2, 1)).toEqual([1,1,1,1]);
            expect(getPx(result, 0, 2)).toEqual([1,1,1,1]);
            expect(getPx(result, 1, 2)).toEqual([1,1,1,1]);
            expect(getPx(result, 2, 2)).toEqual([1,1,1,1]);
        });
        it("should convolute 2", () => {
            const imageTestData = new ImageData(3, 3);
            setPx(imageTestData, 0, 0, [1, 1, 1, 1]);
            setPx(imageTestData, 1, 0, [0, 0, 0, 1]);
            setPx(imageTestData, 2, 0, [0, 0, 0, 1]);
            setPx(imageTestData, 0, 1, [0, 0, 0, 1]);
            setPx(imageTestData, 1, 1, [0, 0, 0, 1]);
            setPx(imageTestData, 2, 1, [0, 0, 0, 1]);
            setPx(imageTestData, 0, 2, [0, 0, 0, 1]);
            setPx(imageTestData, 1, 2, [0, 0, 0, 1]);
            setPx(imageTestData, 2, 2, [1, 1, 1, 1]);

            const kernel = {
                shape: [3,3], 
                values: [
                    1,1,1,
                    1,1,1,
                    1,1,1
                ]
            };
            
            const result = convoluteImage(imageTestData, kernel);

            expect(result.height).toEqual(3);
            expect(result.width).toEqual(3);
            expect(getPx(result, 0, 0)).toEqual([1,1,1,1]);
            expect(getPx(result, 1, 0)).toEqual([1,1,1,1]);
            expect(getPx(result, 2, 0)).toEqual([0,0,0,1]);
            expect(getPx(result, 0, 1)).toEqual([1,1,1,1]);
            expect(getPx(result, 1, 1)).toEqual([1,1,1,1]); //clamped
            expect(getPx(result, 2, 1)).toEqual([1,1,1,1]);
            expect(getPx(result, 0, 2)).toEqual([0,0,0,1]);
            expect(getPx(result, 1, 2)).toEqual([1,1,1,1]);
            expect(getPx(result, 2, 2)).toEqual([1,1,1,1]);
        });
    });
});