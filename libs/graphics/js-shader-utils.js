/**
 * Applys JS shader function, channel values in the shader are represented as normalized floats
 * @typedef {{ row: number, col: number, imageData: ImageData }} PixelMetaData
 * @param {ImageData} imageData 
 * @param {([number, number, number, number], PixelMetaData)} shaderFunc 
 * @returns 
 */
export function applyShader(imageData, shaderFunc){
    const newImageData = new ImageData(imageData.width, imageData.height);
    
    let i = 0;
    while (i < imageData.data.length) {
        const row = Math.floor(i / (imageData.width * 4));
        const col = Math.floor(i / 4) % imageData.width;
        const pixel = shaderFunc([
            imageData.data[i] / 255,
            imageData.data[i + 1] / 255,
            imageData.data[i + 2] / 255,
            imageData.data[i + 3] / 255,
        ], { row, col, imageData });
        newImageData.data[i] = Math.floor(pixel[0] * 255);
        newImageData.data[i + 1] = Math.floor(pixel[1] * 255);
        newImageData.data[i + 2] = Math.floor(pixel[2] * 255);
        newImageData.data[i + 3] = Math.floor(pixel[3] * 255);
        i += 4;
    }

    return newImageData;
}

/**
 * Gets a Rec601 luminosity value greyscale image
 * @param {ImageData} imageData 
 * @returns 
 */
export function getLumaRec601Image(imageData){
    return applyShader(imageData, (px) => {
        const luma = (px[0] * 0.299) + (px[1] * 0.587) + (px[2] * 0.114);
        return [
            luma,
            luma,
            luma,
            px[3]
        ];
    });
}

/**
 * Gets a Rec709 luminosity value greyscale image
 * @param {ImageData} imageData 
 * @returns 
 */
export function getLumaRec709Image(imageData){
    return applyShader(imageData, (px) => {
        const luma = (px[0] * 0.2126) + (px[1] * 0.7152) + (px[2] * 0.0722);
        return [
            luma,
            luma,
            luma,
            px[3]
        ];
    });
}

/**
 * Gets an intensity value (average color) greyscale image
 * @param {ImageData} imageData 
 * @returns 
 */
export function getIntensityImage(imageData){
    return applyShader(imageData, (px) => {
        const avg = (px[0] + px[1] + px[2]) / 3;
        return [
            avg,
            avg,
            avg,
            px[3]
        ];
    });
}

/**
 * Tilizes an image (breaks into tiles and applies a tile level shader)
 * This stuff can probably be done as convolution but need to think about it more
 * @param {*} imageData 
 * @param {*} tileHeight 
 * @param {*} tileWidth 
 * @param {*} tileFunc 
 */
export function tilizeImage(imageData, tileHeight, tileWidth, tileFunc){
    const tileCountX = Math.ceil(imageData.width / tileWidth);
    const tileCountY = Math.ceil(imageData.height / tileHeight);

    for(let y = 0; y < tileCountY; y++){
        for(let x = 0; x < tileCountX; x++){
            const tile = new Uint8ClampedArray(tileHeight * tileWidth * 4);
            const tileStartX = x * tileWidth;
            const tileStartY = y * tileHeight;

            for(let pixelY = 0; pixelY < tileHeight; pixelY++){
                for(let pixelX = 0; pixelX < tileWidth; pixelX++){
                    const pixelIndex = ((tileStartY + pixelY) * imageData.width + (tileStartX + pixelX)) * 4;
                    const tilePixelIndex = ((pixelY * tileWidth) + pixelX) * 4;

                    tile[tilePixelIndex] = imageData.data[pixelIndex];
                    tile[tilePixelIndex + 1] = imageData.data[pixelIndex + 1];
                    tile[tilePixelIndex + 2] = imageData.data[pixelIndex + 2];
                    tile[tilePixelIndex + 3] = imageData.data[pixelIndex + 3];
                }
            }
    
            tileFunc(tile, x, y, imageData);
        }
    }
}

export function getContrastLimitedAdaptiveHistogramEqualization(imageData){
    //divide image into tiles

    //Histogram Equalization

    //clip limit (because it's contrast limited)

    //interpolate tiles
}