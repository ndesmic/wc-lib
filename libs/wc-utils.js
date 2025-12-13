import { padArrayEnd } from "./array-utils.js";

export function parseIntOrDefault(text, defaultValue = 0){
    if(typeof(text) !== "string"){
        return text;
    }
    if(!text.trim()){
        return defaultValue;
    }
    return parseInt(text, 10);
}

/**
 * 
 * @param {Array<number> | string} text 
 * @param {Array<number>} defaultValue 
 * @returns 
 */
export function parseFloatArrayOrDefault(text, defaultValue = null) {
    if(Array.isArray(text)){
        return text;
    }
	return text?.trim()
		? text.split(",").map(x => parseFloat(x.trim()))
		: defaultValue
}

/**
 * 
 * @param {Array<number> | string} text 
 * @param {number} length
 * @param {Array<number>} defaultValue 
 * @returns 
 */
export function parseFloatArrayWithLengthOrDefault(text, length, defaultValue = null) {
    let array;
    if(Array.isArray(text)){
        array = text;
    } else {
	    array = text?.trim()
		    ? text.split(",").map(x => parseFloat(x.trim()))
		    : defaultValue
    }

    if(array.length > length){
        return array.slice(0, length);
    } else if(array.length < length){
        return padArrayEnd(array, length);
    }
    return array;
}