const i32Max = 2147483647;

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
export function meyersDiffNaive(stringA, stringB) {
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

/**
 * @param {string} stringA
 * @param {string} stringB
 * @returns {Edit[]}
 */
export function meyersDiffMiddleSnake(stringA, stringB) {
	const edits = [];
	const maxEdits = stringA.length + stringB.length;
	const maxSize = maxEdits + 1;

	const pathForward = new Int32Array(maxSize).fill(-1);
	const pathBackward = new Int32Array(maxSize).fill(-1);

	function solve(windowStartA, windowLengthA, windowStartB, windowLengthB){
		if(windowLengthA === 0){
			for(let i = 0; i < windowLengthB; i++){
				edits.push({ type: "INSERT", value: stringB.charAt(windowStartB + i)});
			}
			return;
		}
		if(windowLengthB === 0){
			for(let i = 0; i < windowLengthA; i++){
				edits.push({ type: "DELETE", value: stringA.charAt(windowStartA + i)});
			}
			return;
		}

		const snake = getMiddleSnake(windowStartA, windowLengthA, windowStartB, windowLengthB, stringA, stringB, pathForward, pathBackward);

		if(snake){
			const [startX, endX, startY, endY, globalLane, d, editType] = snake;

			const globalStartX = windowStartA + startX;
			const globalStartY = windowStartB + startY;
			const globalEndX = windowStartA + endX;
			const globalEndY = windowStartB + endY;

			const topLeftLengthA = startX;
			const topLeftLengthB = startY;

			solve(windowStartA, topLeftLengthA, windowStartB, topLeftLengthB);

			let currentX = globalStartX;
			let currentY = globalStartY;

			//edit deviation
			if(editType === "DELETE"){
				edits.push({
					type: "DELETE",
					value: stringA.charAt(currentX)
				});
				currentX++;
			} else if(editType === "INSERT"){
				edits.push({
					type: "INSERT",
					value: stringB.charAt(currentY)
				});
				currentY++;
			}

			//diagonal slide
			while(currentX < globalEndX && currentY < globalEndY){
				edits.push({ type: "KEEP", value: stringA.charAt(currentX) });
				currentX++;
				currentY++;
			}
			
			const bottomRightLengthA = (windowStartA + windowLengthA) - globalEndX;
			const bottomRightLengthB = (windowStartB + windowLengthB) - globalEndY;

			solve(globalEndX, bottomRightLengthA, globalEndY, bottomRightLengthB);
		} else {
			let x = 0;
			let y = 0;
			while(x < windowLengthA || y < windowLengthB){
				if(x < windowLengthA && y < windowLengthB && stringA.charCodeAt(windowStartA + x) === stringB.charCodeAt(windowStartB + y)){
					edits.push({ type: "KEEP", value: stringA.charAt(windowStartA + x) });
					x++;
					y++;
				} else if (windowLengthA - x >= windowLengthB - y){
					edits.push({ type: "DELETE", value: stringA.charAt(windowStartA + x) });
					x++;
				} else {
					edits.push({ type: "INSERT", value: stringB.charAt(windowStartB + y) });
					y++;
				}
			}
		}
	}

	solve(0, stringA.length, 0, stringB.length);
	return edits;
}

/**
 * @param {number} windowStartA
 * @param {number} windowLengthA
 * @param {number} windowStartB
 * @param {number} windowLengthB
 * @param {string} stringA
 * @param {string} stringB
 * @returns {Edit[]}
 */
export function getMiddleSnake(windowStartA,windowLengthA,  windowStartB, windowLengthB, stringA, stringB, pathForward, pathBackward) {
	const zeroPoint = stringB.length;

	const maxDepth = Math.ceil((windowLengthA + windowLengthB) / 2);
	const laneStart = 0;
	const laneEnd = windowLengthA - windowLengthB;
	const isLaneEndEven = laneEnd % 2 === 0;

	const globalWindowOffset = windowStartA - windowStartB;
	const globalLaneStart = laneStart + globalWindowOffset;
	const globalLaneEnd = laneEnd + globalWindowOffset;

	pathForward[zeroPoint + globalLaneStart + 1] = 0;
	pathBackward[zeroPoint + globalLaneEnd - 1] = windowLengthA;

	for(let d = 0; d <= maxDepth; d++){
		//forward
		for(let lane = -d; lane <= d; lane += 2){  //for each valid diagonal
			const globalLane = globalLaneStart + lane;
			const left = (lane > -d) 
				? pathForward[zeroPoint + globalLane - 1]
				: -1;
			const right = (lane < d)
				? pathForward[zeroPoint + globalLane + 1]
				: -1;
			let x;
			let editType;

			if(lane === -d || ((lane !== d) && left < right)){
				x = right;
				editType = "INSERT"
			} else {
				x = left + 1;
				editType = "DELETE";
			}
			let y = x - globalLane;

			const startX = x;
			const startY = y;

			//slide diagonals
			while(x < windowLengthA && y < windowLengthB && stringA.charCodeAt(windowStartA + x) === stringB.charCodeAt(windowStartB + y)) {
				x++;
				y++;
			}
			pathForward[zeroPoint + globalLane] = x;

			const furthestLeftBackwardLane = globalLaneEnd - (d - 1);
			const furthestRightBackwardLane = globalLaneEnd + (d - 1);
			if (!isLaneEndEven && globalLane >= furthestLeftBackwardLane  && globalLane <= furthestRightBackwardLane) {
				if (x >= pathBackward[zeroPoint + globalLane]) {
					return [startX, x, startY, y, globalLane, d, editType];
				}
			}
		}
		//backward
		for(let lane = -d; lane <= d; lane += 2){  //for each valid diagonal
			const globalLane = globalLaneEnd + lane;
			const left = (lane > -d) 
				? pathBackward[zeroPoint + globalLane - 1]
				: i32Max;
			const right = (lane < d)
				? pathBackward[zeroPoint + globalLane + 1]
				: i32Max; //necessary to prevent it from breaking up runs on left == right

			let x;
			let editType;

			if(lane === -d || ((lane !== d) && left > right)){
				x = right - 1;
				editType = "DELETE";
			} else {
				x = left;
				editType = "INSERT";
			}
			let y = x - globalLane;

			const endX = x;
			const endY = y;

			//slide diagonals
			while(x > 0 && y > 0 && stringA.charCodeAt(windowStartA + x - 1) === stringB.charCodeAt(windowStartB + y - 1)) {
				x--;
				y--;
			}
			pathBackward[zeroPoint + globalLane] = x;

			const furthestLeftForwardLane = globalLaneStart - d;
			const furthestRightForwardLane = globalLaneStart + d;
			if (isLaneEndEven && globalLane >= furthestLeftForwardLane  && globalLane <= furthestRightForwardLane) {
				const forwardX = pathForward[zeroPoint + globalLane];
				if (forwardX !== -1 && forwardX >= x) {
					return [x, endX, y, endY, globalLane, d, editType];
				}
			}
		}
	}
}

/**
 * @param {Edit[]} edits
 */
export function normalizeMeyersDiff(edits){
	let idxA = 0;
	let idxB = 0;

	let lastType;

	let insertValueBuffer = "";
	let deleteValueBuffer = "";
	let keepValueBuffer = "";

	const normalizedEdits = [];

	for(let i = 0; i < edits.length; i++){
		const currentEdit = edits[i];
		switch(currentEdit.type){
			case "KEEP": {
				if(lastType && lastType !== "KEEP"){
					if(deleteValueBuffer.length > 0){
						normalizedEdits.push({
							type: "DELETE",
							value: deleteValueBuffer
						});
						deleteValueBuffer = "";
					}
					if(insertValueBuffer.length > 0){
						normalizedEdits.push({
							type: "INSERT",
							value: insertValueBuffer
						});
						insertValueBuffer = "";
					}
				}
				lastType = "KEEP";
				idxA++;
				idxB++;
				keepValueBuffer += currentEdit.value;
				continue;
			}
			case "DELETE": {
				if(lastType && lastType === "KEEP"){
					normalizedEdits.push({
						type: "KEEP",
						value: keepValueBuffer
					});
					keepValueBuffer = "";
				}
				lastType = "DELETE";
				idxA++;
				deleteValueBuffer += currentEdit.value;
				break;
			}
			case "INSERT": {
				if(lastType && lastType === "KEEP"){
					normalizedEdits.push({
						type: "KEEP",
						value: keepValueBuffer
					});
					keepValueBuffer = "";
				}
				lastType = "INSERT";
				idxB++;
				insertValueBuffer += currentEdit.value;
				break;
			}
		}
	}

	if(deleteValueBuffer.length > 0){
		normalizedEdits.push({
			type: "DELETE",
			value: deleteValueBuffer
		});
	}
	if(insertValueBuffer.length > 0){
		normalizedEdits.push({
			type: "INSERT",
			value: insertValueBuffer
		});
	}
	if(keepValueBuffer.length > 0){
		normalizedEdits.push({
			type: "KEEP",
			value: keepValueBuffer
		});
	}

	return normalizedEdits;
}

/**
 * Coalesces DELETE/INSERT pairs in REPLACE blocks
 * Must be fed a pre-normalized Edit list
 * @param {Edit[]} edits
 */
export function replaceCoalsceMeyersDiff(edits){
	const replacedEdits = [];

	for(let i = 0; i < edits.length; i++){
		const currentEdit = edits[i];
		const nextEdit = edits[i+1];

		switch(currentEdit.type){
			case "KEEP": {
				replacedEdits.push({
					type: "KEEP",
					value: currentEdit.value
				});
				continue;
			}
			case "DELETE": {
				if(edits[i+1]?.type === "INSERT"){
					if(currentEdit.value.length === edits[i+1].value.length){
						replacedEdits.push({
							type: "REPLACE",
							oldValue: currentEdit.value,
							newValue: nextEdit.value
						});
					} else if(currentEdit.value.length > nextEdit.value.length){
						replacedEdits.push({
							type: "DELETE",
							value: currentEdit.value.slice(0, currentEdit.value.length - nextEdit.value.length)
						});
						replacedEdits.push({
							type: "REPLACE",
							oldValue: currentEdit.value.slice(currentEdit.value.length - nextEdit.value.length),
							newValue: nextEdit.value
						});

					} else if(currentEdit.value.length < nextEdit.value.length){
						replacedEdits.push({
							type: "REPLACE",
							oldValue: currentEdit.value,
							newValue: nextEdit.value.slice(0, currentEdit.value.length)
						});
						replacedEdits.push({
							type: "INSERT",
							value: nextEdit.value.slice(currentEdit.value.length)
						});
					}
					i++;
				} else {
					replacedEdits.push({
						type: "DELETE",
						value: currentEdit.value
					});
					continue;
				}
				break;
			}
			case "INSERT": {
				replacedEdits.push({
					type: "INSERT",
					value: currentEdit.value
				});
				continue;
			}
		}
	}

	return replacedEdits;
}
