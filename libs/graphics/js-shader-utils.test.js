import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { applyShader, getIntensityImage, getLumaRec601Image, getLumaRec709Image, tilizeImage } from "./js-shader-utils.js";
import { getPx, setPx } from "./image-sample-utils.js";
import "../test-matcher-extensions.js";

describe("js-shader-utils", () => {
    const imageData = new ImageData(2, 2);
    setPx(imageData, 0, 0, [1, 0, 0, 1]);
    setPx(imageData, 1, 0, [0, 1, 0, 1]);
    setPx(imageData, 0, 1, [0, 0, 1, 1]);
    setPx(imageData, 1, 1, [1, 1, 0, 1]);

    describe("apply-shader", () => {
        it("should apply a shader", () => {
            const result = applyShader(imageData, (px) => {
                return [
                    px[0] / 2,
                    px[1] / 2,
                    px[2] / 2,
                    px[3]
                ];
            });

            expect(getPx(result, 0,0)).toBeCloseToArray([0.5, 0, 0, 1]);
            expect(getPx(result, 1,0)).toBeCloseToArray([0, 0.5, 0, 1]);
            expect(getPx(result, 0,1)).toBeCloseToArray([0, 0, 0.5, 1]);
            expect(getPx(result, 1,1)).toBeCloseToArray([0.5, 0.5, 0, 1]);
        });
    });
    describe("getLumaRec601Image", () => {
        it("should get rec601 luma image", () => {
            const result = getLumaRec601Image(imageData);

            expect(getPx(result, 0,0)).toBeCloseToArray([0.299, 0.299, 0.299, 1]);
            expect(getPx(result, 1,0)).toBeCloseToArray([0.587, 0.587, 0.587, 1]);
            expect(getPx(result, 0,1)).toBeCloseToArray([0.114, 0.114, 0.114, 1]);
            expect(getPx(result, 1,1)).toBeCloseToArray([0.8823, 0.8823, 0.8823, 1]);
        });
    });
    describe("getLumaRec709Image", () => {
        it("should get rec6709 luma image", () => {
            const result = getLumaRec709Image(imageData);

            expect(getPx(result, 0,0)).toBeCloseToArray([0.2126, 0.2126, 0.2126, 1]);
            expect(getPx(result, 1,0)).toBeCloseToArray([0.7152, 0.7152, 0.7152, 1]);
            expect(getPx(result, 0,1)).toBeCloseToArray([0.0722, 0.0722, 0.0722, 1]);
            expect(getPx(result, 1,1)).toBeCloseToArray([0.9254, 0.9254, 0.9254, 1]);
        });
    });
    describe("getIntensityImage", () => {
        it("should get image with just average color intensity", () => {
            const result = getIntensityImage(imageData);

            expect(getPx(result, 0,0)).toBeCloseToArray([0.33, 0.33, 0.33, 1],1);
            expect(getPx(result, 1,0)).toBeCloseToArray([0.33, 0.33, 0.33, 1],1);
            expect(getPx(result, 0,1)).toBeCloseToArray([0.33, 0.33, 0.33, 1],1);
            expect(getPx(result, 1,1)).toBeCloseToArray([0.66, 0.66, 0.66, 1],1);
        });
    });
    describe("tilize-image", () => {
        const tileImageData = new ImageData(8, 8);
        setPx(tileImageData, 0, 0, [1, 0, 0, 1]);
        setPx(tileImageData, 1, 0, [1, 0, 0, 1]);
        setPx(tileImageData, 2, 0, [1, 0, 0, 1]);
        setPx(tileImageData, 3, 0, [1, 0, 0, 1]);
        setPx(tileImageData, 0, 1, [1, 0, 0, 1]);
        setPx(tileImageData, 1, 1, [1, 0, 0, 1]);
        setPx(tileImageData, 2, 1, [1, 0, 0, 1]);
        setPx(tileImageData, 3, 1, [1, 0, 0, 1]);
        setPx(tileImageData, 0, 2, [1, 0, 0, 1]);
        setPx(tileImageData, 1, 2, [1, 0, 0, 1]);
        setPx(tileImageData, 2, 2, [1, 0, 0, 1]);
        setPx(tileImageData, 3, 2, [1, 0, 0, 1]);
        setPx(tileImageData, 0, 3, [1, 0, 0, 1]);
        setPx(tileImageData, 1, 3, [1, 0, 0, 1]);
        setPx(tileImageData, 2, 3, [1, 0, 0, 1]);
        setPx(tileImageData, 3, 3, [1, 0, 0, 1]);

        setPx(tileImageData, 4, 0, [0, 1, 0, 1]);
        setPx(tileImageData, 5, 0, [0, 1, 0, 1]);
        setPx(tileImageData, 6, 0, [0, 1, 0, 1]);
        setPx(tileImageData, 7, 0, [0, 1, 0, 1]);
        setPx(tileImageData, 4, 1, [0, 1, 0, 1]);
        setPx(tileImageData, 5, 1, [0, 1, 0, 1]);
        setPx(tileImageData, 6, 1, [0, 1, 0, 1]);
        setPx(tileImageData, 7, 1, [0, 1, 0, 1]);
        setPx(tileImageData, 4, 2, [0, 1, 0, 1]);
        setPx(tileImageData, 5, 2, [0, 1, 0, 1]);
        setPx(tileImageData, 6, 2, [0, 1, 0, 1]);
        setPx(tileImageData, 7, 2, [0, 1, 0, 1]);
        setPx(tileImageData, 4, 3, [0, 1, 0, 1]);
        setPx(tileImageData, 5, 3, [0, 1, 0, 1]);
        setPx(tileImageData, 6, 3, [0, 1, 0, 1]);
        setPx(tileImageData, 7, 3, [0, 1, 0, 1]);

        setPx(tileImageData, 0, 4, [0, 0, 1, 1]);
        setPx(tileImageData, 1, 4, [0, 0, 1, 1]);
        setPx(tileImageData, 2, 4, [0, 0, 1, 1]);
        setPx(tileImageData, 3, 4, [0, 0, 1, 1]);
        setPx(tileImageData, 0, 5, [0, 0, 1, 1]);
        setPx(tileImageData, 1, 5, [0, 0, 1, 1]);
        setPx(tileImageData, 2, 5, [0, 0, 1, 1]);
        setPx(tileImageData, 3, 5, [0, 0, 1, 1]);
        setPx(tileImageData, 0, 6, [0, 0, 1, 1]);
        setPx(tileImageData, 1, 6, [0, 0, 1, 1]);
        setPx(tileImageData, 2, 6, [0, 0, 1, 1]);
        setPx(tileImageData, 3, 6, [0, 0, 1, 1]);
        setPx(tileImageData, 0, 7, [0, 0, 1, 1]);
        setPx(tileImageData, 1, 7, [0, 0, 1, 1]);
        setPx(tileImageData, 2, 7, [0, 0, 1, 1]);
        setPx(tileImageData, 3, 7, [0, 0, 1, 1]);

        setPx(tileImageData, 4, 4, [0, 1, 1, 1]);
        setPx(tileImageData, 5, 4, [0, 1, 1, 1]);
        setPx(tileImageData, 6, 4, [0, 1, 1, 1]);
        setPx(tileImageData, 7, 4, [0, 1, 1, 1]);
        setPx(tileImageData, 4, 5, [0, 1, 1, 1]);
        setPx(tileImageData, 5, 5, [0, 1, 1, 1]);
        setPx(tileImageData, 6, 5, [0, 1, 1, 1]);
        setPx(tileImageData, 7, 5, [0, 1, 1, 1]);
        setPx(tileImageData, 4, 6, [0, 1, 1, 1]);
        setPx(tileImageData, 5, 6, [0, 1, 1, 1]);
        setPx(tileImageData, 6, 6, [0, 1, 1, 1]);
        setPx(tileImageData, 7, 6, [0, 1, 1, 1]);
        setPx(tileImageData, 4, 7, [0, 1, 1, 1]);
        setPx(tileImageData, 5, 7, [0, 1, 1, 1]);
        setPx(tileImageData, 6, 7, [0, 1, 1, 1]);
        setPx(tileImageData, 7, 7, [0, 1, 1, 1]);

        it("should apply tile function", () => {
            const tiles = [];
            let tileIndex = 0;
            tilizeImage(tileImageData, 4, 4, (tile) => {
                tiles[tileIndex] = tile;
                tileIndex++;
            });

            expect(tiles[0]).toEqual(Uint8ClampedArray.from([
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255,    
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255, 
                255, 0, 0, 255]));

            expect(tiles[1]).toEqual(Uint8ClampedArray.from([
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255,    
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255, 
                0, 255, 0, 255]));

            // expect(tiles[2]).toEqual(Uint8ClampedArray.from([
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255,    
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255, 
            //     0, 0, 255, 255]));

            // expect(tiles[3]).toEqual(Uint8ClampedArray.from([
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255,    
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255, 
            //     0, 255, 255, 255]));
        });
    });
});