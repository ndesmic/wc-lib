/**
 * @typedef {{ left: number, width: number, top: number, height: number }} SizeRect
 * @param {SizeRect} rectA 
 * @param {SizeRect} rectB 
 * @returns 
 */
export function getIntersectionArea(rectA, rectB) {
	const overlapX = Math.max(0, Math.min(rectA.left + rectA.width, rectB.left + rectB.width) - Math.max(rectA.left, rectB.left));
	const overlapY = Math.max(0, Math.min(rectA.top + rectA.height, rectB.top + rectB.height) - Math.max(rectA.top, rectB.top));
	return overlapX * overlapY;
}

/**
 * @typedef {{ left: number, right: number, top: number, bottom: number }} PositionRect
 * @param {PositionRect} rectA 
 * @param {PositionRect} rectB 
 * @returns 
 */
export function checkAABB(rectA, rectB){
	return !(rectA.left > rectB.right || rectA.right < rectB.left || rectA.bottom < rectB.top || rectA.top > rectB.bottom);
}

/**
 * @typedef {{ x: number, y: number }} Point2D
 * @param {Point2D} point 
 * @param {PositionRect} rect 
 */
export function checkPointInside(point, rect){
	return point.x >= rect.left && point.x <= rect.left + rect.width && point.y >= rect.top && point.y <= rect.top + rect.height;
}