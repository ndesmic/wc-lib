/**
 * @typedef { "KEEP" | "DELETE" | "INSERT" } EditType
 * @typedef { type: EditType, value: string } Edit
 * @typedef { number[] } History
 */

import { assertFalse } from "jsr:@std/assert@^1.0.14/false";

const i32Max = 2147483647;

/**
 * @param {string} stringA
 * @param {string} stringB
 * @returns {Edit[]}
 */
export function meyersDiff2(stringA, stringB) {
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

		if(snake && snake[5] > 0){
			const [startX, endX, startY, endY, globalLane, d] = snake;

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
			if((currentX - currentY) !== globalLane){
				if(currentX < globalEndX){
					edits.push({ type: "DELETE", value: stringA.charAt(currentX) });
					currentX++;
				} else if (currentY < globalEndY){
					edits.push({ type: "INSERT", value: stringB.charAt(currentY) });
					currentY++;
				}
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
			if(lane === -d || ((lane !== d) && left < right)){
				x = right;
			} else {
				x = left + 1;
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
					return [startX, x, startY, y, globalLane, d];
				}
			}
		}
		//backward
		for(let lane = -d; lane <= d; lane += 2){  //for each valid diagonal
			const globalLane = globalLaneEnd + lane;
			const left = (lane > -d) 
				? pathBackward[zeroPoint + globalLane - 1]
				: i32Max;
			const right = (lane > d)
				? pathBackward[zeroPoint + globalLane + 1]
				: i32Max; //necessary to prevent it from breaking up runs on left == right

			let x;
			if(lane === -d || ((lane !== d) && left > right)){
				x = right - 1;
			} else {
				x = left;
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
					return [x, endX, y, endY, globalLane, d];
				}
			}
		}
	}
}
