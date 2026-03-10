import { ArrayCanvas } from "./array-canvas.js"
import { getPermutations } from "../../libs/array-utils.js";

/**
 * 
 * @param {number} version 
 * @returns {number}
 */
export function getVersionSize(version) {
	return ((version - 1) * 4) + 21;
}
export function roundUp(value, increment) {
	return Math.ceil(value / increment) * increment;
}
export function roundDown(value, increment) {
	return Math.floor(value / increment) * increment;
}

export const masks = [
	(c, r) => (r + c) % 2,
	(c, r) => r % 2,
	(c, r) => c % 3,
	(c, r) => (r + c) % 2,
	(c, r) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2,
	(c, r) => ((r * c) % 2) + ((r * c) % 3),
	(c, r) => (((r * c) % 2) + ((r * c) % 3)) % 2,
	(c, r) => (((r + c) % 2) + ((r * c) % 3)) % 2
];

export function getAlignmentPositions(version) {
	if (version < 2) return [];
	const patternCount = Math.floor(version / 7) + 1
	const width = getVersionSize(version);
	const totalDistance = width - 13;
	let step = Math.round(totalDistance / patternCount);
	step += step & 0b1; //round to nearest even number
	const positions = [6];
	for (let i = 1; i <= patternCount; i++) {
		positions.push(6 + totalDistance - (step * (patternCount - i)));

	}

	return positions;
}

/**
 * Pattern is 3-valued: 1 = black, 0 = white, -1 = reserved (white but skipped for payload)
 */
export class QrCanvas extends ArrayCanvas {
	version;
	#mask = null;

	constructor(options) {
		super(options);
		this.version = options.version;
		this.drawLayout();
	}

	static fromVersion(version) {
		const size = getVersionSize(version)
		return new QrCanvas({ height: size, width: size, version });
	}

	drawLayout() {
		//top-left finder pattern
		this.drawOutlineRect(0, 0, 7, 7, 3); //outer black ring
		this.drawOutlineRect(1, 1, 5, 5, 2); //inner white ring
		this.drawFilledRect(2, 2, 3, 3, 3); //middle black dot
		this.drawHorizontalLine(0, 7, 8, 2); //padding lower
		this.drawVerticalLine(7, 0, 8, 2); //padding right

		//top-right finder pattern
		this.drawOutlineRect(this.width - 7, 0, 7, 7, 3); //outer black ring
		this.drawOutlineRect(this.height - 6, 1, 5, 5, 2); //inner white ring
		this.drawFilledRect(this.width - 5, 2, 3, 3, 3); //middle black dot
		this.drawHorizontalLine(this.width - 8, 7, 8, 2); //padding lower
		this.drawVerticalLine(this.width - 8, 0, 8, 2); //padding left

		//bottom-left finder pattern
		this.drawOutlineRect(0, this.height - 7, 7, 7, 3); //outer black ring
		this.drawOutlineRect(1, this.height - 6, 5, 5, 2); //inner white ring
		this.drawFilledRect(2, this.height - 5, 3, 3, 3); //middle black dot
		this.drawHorizontalLine(0, this.height - 8, 8, 2); //padding upper
		this.drawVerticalLine(7, this.height - 8, 8, 2); //padding right

		this.drawAlignmentPatterns();

		//timing patterns
		this.drawVerticalTimingPattern(6, 8, this.height - 16);
		this.drawHorizontalTimingPattern(8, 6, this.width - 16);
		this.drawPixel(8, (4 * this.version) + 9, 1); //dark module

		this.reserveHorizontalLine(0, 8, 9); //format reserved space under top-left finder pattern
		this.reserveVerticalLine(8, 0, 8); //format reserved space to the right of top-left finder pattern
		this.reserveHorizontalLine(this.width - 8, 8, 8); //format reserved space under top-right finder pattern
		this.reserveVerticalLine(8, this.height - 7, 7); //format reserved space to the right of bottom-left finder pattern

		if (this.version >= 7) {
			this.reserveRect(0, this.height - 11, 6, 3); //format reserved space above bottom-left finder pattern
			this.reserveRect(this.width - 11, 0, 3, 6); //format reserved space to the left of top-right finder pattern
		}
	}
	drawAlignmentPatterns(){
		const positions = getAlignmentPositions(this.version);
		const coordinates = getPermutations(positions, 2);
		coordinates.push(...positions.map(p => [p,p]));
		for (const [c, r] of coordinates) {
			if (this.getPixel(c, r) === 0) {
				this.drawAlignmentPattern(c, r);
			}
		}

	}
	drawAlignmentPattern(x, y) {
		this.drawOutlineRect(x - 2, y - 2, 5, 5, 3);
		this.drawOutlineRect(x - 1, y - 1, 3, 3, 2);
		this.drawPixel(x, y, 3);
	}
	drawVerticalTimingPattern(x, y, length) {
		for (let i = 0; i < length; i++) {
			this.drawPixel(x, y + i, i % 2 === 1 ? 2 : 3);
		}
	}
	drawHorizontalTimingPattern(x, y, length) {
		for (let i = 0; i < length; i++) {
			this.drawPixel(x + i, y, i % 2 === 1 ? 2 : 3);
		}
	}
	reserveHorizontalLine(x, y, length) {
		for (let i = 0; i < length; i++) {
			if (this.getPixel(x + i, y) === 0) {
				this.drawPixel(x + i, y, 2);
			}
		}
	}
	reserveVerticalLine(x, y, length) {
		for (let i = 0; i < length; i++) {
			if (this.getPixel(x, y + i) === 0) {
				this.drawPixel(x, y + i, 2);
			}
		}
	}
	reserveRect(x, y, width, height) {
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				if (this.getPixel(col, row) === 0) {
					this.drawPixel(col, row, 2);
				}
			}
		}
	}
	//payload must always be the right length for the version to avoid errors
	drawPayloadData(payload) {
		let payloadIndex = 0;
		let isGoingUp = true;

		//gets a 2 pixel column to traverse in a zig-zag motion from right to left, up to down, ignores reserved space, skips timing column
		for (let dataColumnStart = this.width - 2; dataColumnStart >= 0; dataColumnStart -= 2) {
			if (dataColumnStart == 5) { //all QR codes have odd sizes, and the smallest is 21x21 so this will always hit
				dataColumnStart--;
			}
			let sliceRow = 0;
			let slicePathIndex = 0;
			while (sliceRow < this.height) {
				const sliceColumn = 1 - slicePathIndex % 2;
				sliceRow = Math.floor(slicePathIndex / 2);

				const canvasColumn = dataColumnStart + sliceColumn;
				const canvasRow = isGoingUp
					? this.height - sliceRow - 1
					: sliceRow;

				if (this.getPixel(canvasColumn, canvasRow) === 0) {
					this.drawPixel(canvasColumn, canvasRow, payload[payloadIndex++]);
				}
				slicePathIndex++;
			}
			isGoingUp = !isGoingUp;
		}
	}
	drawFormatString(formatString) {
		//top-left
		//horizontal line
		this.drawPixel(0, 8, formatString[0] + 2);
		this.drawPixel(1, 8, formatString[1] + 2);
		this.drawPixel(2, 8, formatString[2] + 2);
		this.drawPixel(3, 8, formatString[3] + 2);
		this.drawPixel(4, 8, formatString[4] + 2);
		this.drawPixel(5, 8, formatString[5] + 2);
		this.drawPixel(7, 8, formatString[6] + 2); //skip timing pattern
		this.drawPixel(8, 8, formatString[7] + 2);
		//vertical line
		this.drawPixel(8, 7, formatString[8] + 2);
		this.drawPixel(8, 5, formatString[9] + 2);
		this.drawPixel(8, 4, formatString[10] + 2);
		this.drawPixel(8, 3, formatString[11] + 2);
		this.drawPixel(8, 2, formatString[12] + 2);
		this.drawPixel(8, 1, formatString[13] + 2);
		this.drawPixel(8, 0, formatString[14] + 2);

		//bottom-left
		this.drawPixel(8, -1, formatString[0] + 2);
		this.drawPixel(8, -2, formatString[1] + 2);
		this.drawPixel(8, -3, formatString[2] + 2);
		this.drawPixel(8, -4, formatString[3] + 2);
		this.drawPixel(8, -5, formatString[4] + 2);
		this.drawPixel(8, -6, formatString[5] + 2);
		this.drawPixel(8, -7, formatString[6] + 2);

		//top-right
		this.drawPixel(-8, 8, formatString[7] + 2);
		this.drawPixel(-7, 8, formatString[8] + 2);
		this.drawPixel(-6, 8, formatString[9] + 2);
		this.drawPixel(-5, 8, formatString[10] + 2);
		this.drawPixel(-4, 8, formatString[11] + 2);
		this.drawPixel(-3, 8, formatString[12] + 2);
		this.drawPixel(-2, 8, formatString[13] + 2);
		this.drawPixel(-1, 8, formatString[14] + 2);
	}
	drawVersionString(versionString) {
		//lower-left
		let i = 0;
		let row = -9;
		let col = 5;
		while (i < versionString.length) {
			this.drawPixel(col, row, versionString[i] + 2);
			i++;
			if (i % 3 === 0) {
				col--;
				row = -9
			} else {
				row--;
			}
		}
		//upper-right
		i = 0;
		row = 5;
		col = -9;
		while (i < versionString.length) {
			this.drawPixel(col, row, versionString[i] + 2);
			i++;
			if (i % 3 === 0) {
				row--
				col = -9
			} else {
				col--
			}
		}
	}
	getPenaltyScoreForRowSpans() {
		const rowScores = new Array(this.height);
		for (let r = 0; r < this.height; r++) {
			let score = 0;
			let run = 1;
			let runPx = this.getMaskedPixel(0, r);
			for (let c = 1; c < this.width; c++) {
				const px = this.getMaskedPixel(c, r);
				if (px === runPx) {
					run++;
					if (run === 5) {
						score += 3;
					}
					if (run > 5) {
						score += 1;
					}
				} else {
					run = 1;
					runPx = px;
				}
			}
			rowScores[r] = score;
		}
		return rowScores;
	}
	getPenaltyScoreForColSpans() {
		const colScores = new Array(this.width);
		for (let c = 0; c < this.width; c++) {
			let score = 0;
			let run = 1;
			let runPx = this.getMaskedPixel(c, 0);
			for (let r = 1; r < this.height; r++) {
				const px = this.getMaskedPixel(c, r);
				if (px === runPx) {
					run++;
					if (run === 5) {
						score += 3;
					}
					if (run > 5) {
						score += 1;
					}
				} else {
					run = 1;
					runPx = px;
				}
			}
			colScores[c] = score;
		}
		return colScores;
	}
	getPenaltyScoreForSpans() {
		const rowScore = this.getPenaltyScoreForRowSpans().reduce((sum, x) => sum + x);
		const colScore = this.getPenaltyScoreForColSpans().reduce((sum, x) => sum + x);
		return rowScore + colScore;
	}
	getPenaltyScoreForBlocks() {
		let score = 0;
		for (let c = 0; c < this.width - 1; c++) {
			for (let r = 0; r < this.height - 1; r++) {
				const tl = this.getMaskedPixel(c, r);
				const tr = this.getMaskedPixel(c + 1, r);
				const bl = this.getMaskedPixel(c, r + 1);
				const br = this.getMaskedPixel(c + 1, r + 1);
				if (tl === tr && tl === bl && tl === br) {
					score += 3;
				}
			}
		}
		return score;
	}
	getPenaltyScoreForMarkers() {
		let score = 0;
		const patterns = [
			[true, false, true, true, true, false, true, false, false, false, false],
			[false, false, false, false, true, false, true, true, true, false, true]
		];
		for (let c = 0; c < this.width - 11; c++) {
			for (let r = 0; r < this.height - 11; r++) {

				for (const pattern of patterns) {
					let matched = 0
					for (let i = 0; i < pattern.length; i++) {
						if (this.getMaskedPixel(c + i, r) === pattern[i]) {
							matched++;
						} else {
							break;
						}
					}
					if (matched === pattern.length) {
						score += 40;
					}

					matched = 0; //reset
					for (let i = 0; i < pattern.length; i++) {
						if (this.getMaskedPixel(c, r + i) === pattern[i]) {
							matched++;
						} else {
							break;
						}
					}
					if (matched === pattern.length) {
						score += 40;
					}
				}
			}
		}
		return score;
	}
	getPenaltyScoreForRatio() {
		let count = 0;
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++)
				if (this.getMaskedPixel(i, j)) {
					count++;
				}
		}
		const percent = count / this.data.length * 100;
		const previousDisplacement = Math.abs(roundDown(percent, 5) - 50) / 5;
		const nextDisplacement = Math.abs(roundUp(percent, 5) - 50) / 5;
		return Math.min(previousDisplacement, nextDisplacement) * 10;
	}
	getPenaltyScore() {
		const penaltyScoreForSpans = this.getPenaltyScoreForSpans();
		const penaltyScoreForBlocks = this.getPenaltyScoreForBlocks();
		const penaltyScoreForMarkers = this.getPenaltyScoreForMarkers();
		const penaltyScoreForRatio = this.getPenaltyScoreForRatio();

		return penaltyScoreForSpans + penaltyScoreForBlocks + penaltyScoreForMarkers + penaltyScoreForRatio;
	}
	getBestMask() {
		let lowestScore = Infinity;
		let lowestScoreIndex = -1;
		for (let i = 0; i < masks.length; i++) {
			this.applyMask(masks[i]);
			const score = this.getPenaltyScore();
			if (lowestScore > score) {
				lowestScore = score;
				lowestScoreIndex = i;
			}
		}
		this.#mask = null;
		return lowestScoreIndex;
	}
	applyMask(mask) {
		this.#mask = mask;
	}
	getMaskedPixel(col, row) {
		const px = this.getPixel(col, row);
		if (px === 3) return true;
		if (px === 2) return false;
		if (!this.#mask) return px === 1;

		if (this.#mask(col, row) == 0) {
			return px !== 1;
		} else {
			return px === 1;
		}
		// ? px !== 1
		// : px === 1;
	}
	printMasked() {
		const result = [];
		for (let row = 0; row < this.height; row++) {
			const outRow = []
			for (let col = 0; col < this.width; col++) {
				outRow.push(this.getMaskedPixel(col, row));
			}
			result.push(outRow.join(","));
		}
		return result.join("\n");
	}
}