function getRelative(array, zeroPoint, k) {
	return array[zeroPoint + k];
}

function setRelative(array, zeroPoint, k, value) {
	return array[zeroPoint + k] = value;
}

/**
 * @typedef { "KEEP" | "DELETE" | "INSERT" } EditType
 * @typedef { type: EditType, value: string } Edit
 * @typedef { number[] } History
 */

/**
 * @param {string} stringA
 * @param {string} stringB
 * @returns {Edit[]}
 */
export function meyersDiff(stringA, stringB) {
	const history = meyersDiffForward(stringA, stringB);
	return meyersDiffBackward(history, stringA, stringB);
}

/**
 * @param {string} stringA
 * @param {string} stringB
 * @returns {History}
 */
export function meyersDiffForward(stringA, stringB) {
	const maxEdits = stringA.length + stringB.length;
	const maxSize = maxEdits + 1;
	const furthestDistances = new Array(maxSize).fill(-1);
	const setDistanceIdx = setRelative.bind(this, furthestDistances, stringB.length);

	//by default we read right so this needs to be initialized
	setDistanceIdx(1, 0);

	const history = [];

	for (let d = 0; d <= maxEdits; d++) {
		let minK = Math.max(-d, -stringB.length);
		const maxK = Math.min(d, stringA.length);

		//we can't get to even tracks from even tracks so for efficency we check every +2 tracks but the bounds need to align so it works
		if (Math.abs(minK % 2) !== (d % 2)) {
			minK += 1;
		}

		for (let k = minK; k <= maxK; k += 2) {
			let left = -1;
			if (k - 1 >= -stringB.length) {
				left = getRelative(furthestDistances, stringB.length, k - 1);
			}

			let right = -1;
			if (k + 1 <= stringA.length) {
				right = getRelative(furthestDistances, stringB.length, k + 1);
			}

			let x;
			if (k === -d || (k !== d && left < right)) {
				x = right;
			} else {
				x = left + 1;
			}

			let y = x - k;

			while (x < stringA.length && y < stringB.length && stringA.charAt(x) === stringB.charAt(y)) {
				x += 1;
				y += 1;
			}

			setDistanceIdx(k, x);

			if (x >= stringA.length && y >= stringB.length) {
				history.push([...furthestDistances]);
				return history;
			}
		}

		history.push([...furthestDistances]);
	}

	return history;
}

/**
 * @param {History} history
 * @param {string} stringA
 * @param {string} stringB
 * @returns {Edit[]}
 */
export function meyersDiffBackward(history, stringA, stringB) {
	let x = stringA.length;
	let y = stringB.length;
	const edits = [];

	for (let d = history.length - 1; d > 0; d--) {
		const k = x - y;
		const distances = d > 0 ? history[d - 1] : history[0];

		let left = -1;
		if (k - 1 >= -stringB.length) {
			left = getRelative(distances, stringB.length, k - 1);
		}

		let right = -1;
		if (k + 1 <= stringA.length) {
			right = getRelative(distances, stringB.length, k + 1);
		}

		let prevK;
		if (k === -d || (k !== d && left < right)) {
			prevK = k + 1;
		} else {
			prevK = k - 1;
		}

		let prevX = getRelative(distances, stringB.length, prevK);

		if (prevX === -1) {
			prevX = 0;
		}

		let prevY = prevX - prevK;

		if (prevY < 0) {
			prevY = 0;
		}

		while (x > prevX && y > prevY && stringA.charAt(x - 1) === stringB.charAt(y - 1)) {
			edits.unshift({ type: "KEEP", value: stringA.charAt(x - 1) });
			x--;
			y--;
		}

		if (x === prevX) {
			edits.unshift({ type: "INSERT", value: stringB.charAt(y - 1) });
			y--;
		} else {
			edits.unshift({ type: "DELETE", value: stringA.charAt(x - 1) });
			x--;
		}
	}

	while (x > 0 || y > 0){
		if(x > 0 && y > 0 && stringA.charAt(x - 1) === stringB.charAt(y - 1)) {
			edits.unshift({ type: "KEEP", value: stringA.charAt(x - 1) });
			x--;
			y--;
		} else if(y > 0 && (x === 0 || (x -y) === -history.length)){
			edits.unshift({ type: "INSERT", value: stringB.charAt(y - 1)});
			y--;
		} else {
			edits.unshift({ type: "DELETE", value: stringA.charAt(x - 1)});
			x--;
		}
	}

	return edits;
}
