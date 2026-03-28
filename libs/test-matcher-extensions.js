import { expect } from "@std/expect/expect";

expect.extend({
	toBeCloseToArray(received, expected, numDigits = 2){
        if(!Array.isArray(received.value)){
            return {
                pass: false,
                message: () => `${JSON.stringify(received.value)} is not an array`
            };
        }

		let pass = true;
		let lastIndex = 0;

		for(let i = 0; i < received.value.length; i++){
			const diff = Math.abs(received.value[i] - expected[i]);
			if(diff > 10 ** -numDigits / 2){
				pass = false;
				lastIndex = i;
				break;
			}
		}

		return {
			pass,
			message: () => `expected ${received.value} ${pass ? "not to be close" : "to be close"} to ${expected} within ${numDigits} decimal places. Arrays differ at index ${lastIndex}, got ${received.value[lastIndex]}, expected ${expected[lastIndex]}`
		}
	}
})