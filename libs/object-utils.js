/**
 * 
 * @param {Object} obj 
 * @param {string | number | Function} accessor 
 * @param {any} defaultValue 
 * @returns 
 */
export function accessProperty(obj, accessor, defaultValue = null){
    if(!obj || !accessor){
          return defaultValue;
    }
    if(typeof(accessor) === "function"){
        return accessor(obj);
    }

    const accessorParts = typeof(accessor) === "string" 
        ? accessor.split(".") 
        : accessor; //numbers

    if(accessorParts.length === 1){
        return obj[accessorParts[0]] ?? defaultValue;
    }

    return accessProperty(obj[accessorParts[0]], accessorParts.slice(1), defaultValue);
}