import { lerp } from "./math-utils.js";

/**
 * 
 * @param {number[]} start 
 * @param {number[]} end 
 * @param {number} value 
 * @returns 
 */
export function lerpVector(start, end, value){
    const result = new Array(start.length);
    for(let i = 0; i < start.length; i++){
        result[i] = lerp(start[i], end[i], value);
    }
    return result;
}