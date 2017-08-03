"use strict";
const Util = (function(){
	function window(v, vmin, vmax, flipped = false){
		v = flipped ? -v : v;
		return v - vmin;
	}
	function center(vlength, vmin, vmax){
		const center = (vmax - vmin) / 2;
		return center - (vlength / 2);
	}
	function trimObject(obj){
		const newObj = {};
		for(let key in obj){
			if(obj[key] !== undefined){
				newObj[key] = obj[key];
			}
		}
		return newObj;
	}
	return {
		window,
		center,
		trimObject
	};
})();
