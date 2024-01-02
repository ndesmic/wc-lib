import { QrCanvas, getAlignmentPositions, getVersionSize, masks } from "./qr-canvas.js";
import { getRange, chunkArray } from "./utils.js";

describe("QrCanvas", () => {
	describe("getVersionSize", () => {
		[
			[1, 21],
			[2, 25],
			[40, 177]
		].forEach(test =>
			it(`gets version size for version ${test[0]}`, () => {
				expect(getVersionSize(test[0])).toBe(test[1]);
			})
		);
	});
	describe("getAlignmentPositions", () => {
		[
			[1, []],
			[2, [6,18]],
			[3, [6,22]],
			[4, [6,26]],
			[5, [6,30]],
			[6, [6,34]],
			[7, [6,22,38]],
			[8, [6,24,42]],
			[9, [6,26,46]],
			[10, [6,28,50]],
			[11, [6,30,54]],
			//..
			[14, [6,26,46,66]],
			//..
			[21, [6,28,50,72,94]],
			//..
			[28, [6,26,50,74,98,122]],
			//..
			[32, [6,34,60,86,112,138]], //problem case
			//..
			[35, [6,30,54,78,102,126,150]],
			[36, [6,24,50,76,102,128,154]], //problem case
			//.
			[39, [6,26,54,82,110,138,166]]
		].forEach(([version, expected]) => 
			it(`should get positions for ${version}`, () => {
				expect(getAlignmentPositions(version)).toEqual(expected);
			})
		);
	});
	describe("drawLayout", () => {
		it("should draw alignment pattern", () => {
			const canvas = new QrCanvas({ height: 25, width: 25, version: 2 });

			//outer
			expect(canvas.getPixel(16, 16)).toEqual(3);
			expect(canvas.getPixel(17, 16)).toEqual(3);
			expect(canvas.getPixel(18, 16)).toEqual(3);
			expect(canvas.getPixel(19, 16)).toEqual(3);
			expect(canvas.getPixel(20, 16)).toEqual(3);
			expect(canvas.getPixel(20, 17)).toEqual(3);
			expect(canvas.getPixel(20, 18)).toEqual(3);
			expect(canvas.getPixel(20, 19)).toEqual(3);
			expect(canvas.getPixel(20, 20)).toEqual(3);
			expect(canvas.getPixel(16, 20)).toEqual(3);
			expect(canvas.getPixel(17, 20)).toEqual(3);
			expect(canvas.getPixel(18, 20)).toEqual(3);
			expect(canvas.getPixel(19, 20)).toEqual(3);
			expect(canvas.getPixel(16, 17)).toEqual(3);
			expect(canvas.getPixel(16, 18)).toEqual(3);
			expect(canvas.getPixel(16, 19)).toEqual(3);
			//padding
			expect(canvas.getPixel(17, 17)).toEqual(2);
			expect(canvas.getPixel(18, 17)).toEqual(2);
			expect(canvas.getPixel(19, 17)).toEqual(2);
			expect(canvas.getPixel(19, 18)).toEqual(2);
			expect(canvas.getPixel(19, 19)).toEqual(2);
			expect(canvas.getPixel(18, 19)).toEqual(2);
			expect(canvas.getPixel(17, 19)).toEqual(2);
			expect(canvas.getPixel(17, 18)).toEqual(2);
			//center
			expect(canvas.getPixel(18, 18)).toEqual(3);
		});
	});
	describe("drawPayloadData", () => {
		it("should follow iteration pattern", () => {
			//This test is too small for a real QR code, and therefore doesn't run into the timing column, oob ignore prevents layout from erroring
			const canvas = new QrCanvas({ height: 6, width: 6, outOfBoundsBehavior: "ignore" });
			canvas.reset(); //clear layout
			const data = getRange({ end: 6 * 6 - 1 });

			canvas.height = 6;
			canvas.width = 6;

			canvas.drawPayloadData(data);
			expect(canvas.data).toEqual([
				35, 34, 13, 12, 11, 10,
				33, 32, 15, 14, 9, 8,
				31, 30, 17, 16, 7, 6,
				29, 28, 19, 18, 5, 4,
				27, 26, 21, 20, 3, 2,
				25, 24, 23, 22, 1, 0
			]);
		});
		it("should skip reserved space", () => {
			//This test is too small for a real QR code, and therefore doesn't run into the timing column, oob ignore prevents layout from erroring
			const canvas = new QrCanvas({ height: 6, width: 6, outOfBoundsBehavior: "ignore" });
			canvas.reset(); //clear layout
			const data = getRange({ end: (6 * 6) - 1 - 6 })

			canvas.height = 6;
			canvas.width = 6;

			canvas.reserveHorizontalLine(0, 3, 6);
			canvas.drawPayloadData(data);
			expect(canvas.data).toEqual([
				29, 28, 11, 10, 9, 8,
				27, 26, 13, 12, 7, 6,
				25, 24, 15, 14, 5, 4,
				2, 2, 2, 2, 2, 2,
				23, 22, 17, 16, 3, 2,
				21, 20, 19, 18, 1, 0
			]);
		});
		it("should skip timing column", () => {
			//This test is too small for a real QR code, and therefore doesn't run into the timing column, oob ignore prevents layout from erroring
			const canvas = new QrCanvas({ height: 10, width: 10, outOfBoundsBehavior: "ignore" });
			canvas.reset(); //clear layout
			const data = getRange({ end: 10 * 10 - 1 })

			canvas.height = 10;
			canvas.width = 11;

			canvas.drawPayloadData(data);
			expect(canvas.data).toEqual([
				99, 98, 61, 60, 59, 58, 0, 21, 20, 19, 18,
				97, 96, 63, 62, 57, 56, 0, 23, 22, 17, 16,
				95, 94, 65, 64, 55, 54, 0, 25, 24, 15, 14,
				93, 92, 67, 66, 53, 52, 0, 27, 26, 13, 12,
				91, 90, 69, 68, 51, 50, 0, 29, 28, 11, 10,
				89, 88, 71, 70, 49, 48, 0, 31, 30, 9, 8,
				87, 86, 73, 72, 47, 46, 0, 33, 32, 7, 6,
				85, 84, 75, 74, 45, 44, 0, 35, 34, 5, 4,
				83, 82, 77, 76, 43, 42, 0, 37, 36, 3, 2,
				81, 80, 79, 78, 41, 40, 0, 39, 38, 1, 0
			]);
		});
	});
	describe("getPenaltyScoreForRowSpans", () => {
		it("should get row penalty scores for long runs", () => {
			const canvas = new QrCanvas({ height: 10, width: 10, outOfBoundsBehavior: "ignore" });
			canvas.reset();

			canvas.drawHorizontalLine(0, 0, 7, 1); //5
			canvas.drawHorizontalLine(3, 1, 5, 1); //3
			canvas.drawPixel(1, 2, 1); canvas.drawPixel(3, 2, 1); canvas.drawPixel(5, 2, 1); //0
			canvas.drawPixel(4, 3, 1); canvas.drawPixel(6, 3, 1); //0
			canvas.drawHorizontalLine(7, 4, 3, 1); //5
			canvas.drawHorizontalLine(0, 5, 3, 1); canvas.drawHorizontalLine(8, 5, 2, 1); //3
			canvas.drawHorizontalLine(0, 6, 2, 1); canvas.drawPixel(3, 6, 1, 1); canvas.drawPixel(5, 6, 1, 1); canvas.drawHorizontalLine(7, 6, 3, 1); //0
			canvas.drawHorizontalLine(0, 7, 4, 1); canvas.drawHorizontalLine(7, 7, 3, 1); //0
			canvas.drawHorizontalLine(0, 8, 10, 1); //8
			//8

			const result = canvas.getPenaltyScoreForRowSpans();
			expect(result).toEqual([
				5,
				3,
				0,
				0,
				5,
				3,
				0,
				0,
				8,
				8
			]);
		});
	});
	describe("getPenaltyScoreForColSpans", () => {
		it("should get column penalty scores for long runs", () => {
			const canvas = new QrCanvas({ height: 10, width: 10, outOfBoundsBehavior: "ignore" });
			canvas.reset();

			canvas.drawVerticalLine(0, 0, 7, 1); //5
			canvas.drawVerticalLine(1, 3, 5, 1); //3
			canvas.drawPixel(2, 1, 1); canvas.drawPixel(2, 3, 1); canvas.drawPixel(2, 5, 1); //0
			canvas.drawPixel(3, 4, 1); canvas.drawPixel(3, 6, 1); //0
			canvas.drawVerticalLine(4, 7, 3, 1); //5
			canvas.drawVerticalLine(5, 0, 3, 1); canvas.drawVerticalLine(5, 8, 2, 1); //3
			canvas.drawVerticalLine(6, 0, 2, 1); canvas.drawPixel(6, 3, 1, 1); canvas.drawPixel(6, 5, 1, 1); canvas.drawVerticalLine(6, 7, 3, 1); //0
			canvas.drawVerticalLine(7, 0, 4, 1); canvas.drawVerticalLine(7, 7, 3, 1); //0
			canvas.drawVerticalLine(8, 0, 10, 1); //8
			//8

			const result = canvas.getPenaltyScoreForColSpans();
			expect(result).toEqual([
				5,
				3,
				0,
				0,
				5,
				3,
				0,
				0,
				8,
				8
			]);
		});
	});
	describe("getPenaltyScoreForBlocks", () => {
		it("should get row penalty scores blocks of pixels", () => {
			const canvas = new QrCanvas({ height: 5, width: 5, outOfBoundsBehavior: "ignore" });
			canvas.reset();

			canvas.drawFilledRect(1, 0, 2, 2, 1);
			canvas.drawFilledRect(2, 3, 3, 3, 1);

			const result = canvas.getPenaltyScoreForBlocks();
			expect(result).toEqual(21);
		});
	});
	describe("getPenaltyScoreForMarkers", () => {
		it("should penalty scores for special markers", () => {
			const canvas = new QrCanvas({ height: 20, width: 20, outOfBoundsBehavior: "ignore" });
			canvas.reset();

			const pattern1 = [true, false, true, true, true, false, true, false, false, false, false];
			const pattern2 = [false, false, false, false, true, false, true, true, true, false, true];

			//markers should be aligned to edge because they will be counted multiple times due to the pattern symmetry
			for (let i = 0; i < pattern1.length; i++) {
				canvas.drawPixel(i, 4, pattern1[i] ? 1 : 0);
			}
			for (let i = 0; i < pattern2.length; i++) {
				canvas.drawPixel(9, 5, pattern2[i] ? 1 : 0);
			}
			for (let i = 0; i < pattern2.length; i++) {
				canvas.drawPixel(0, 4 + i, pattern1[i] ? 1 : 0);
			}
			for (let i = 0; i < pattern2.length; i++) {
				canvas.drawPixel(19, 5 + i, pattern2[i] ? 1 : 0);
			}

			const result = canvas.getPenaltyScoreForMarkers();
			expect(result).toEqual(120);
		});
	});
	describe("getPenaltyScoreForRatio", () => {
		it("should get row penalty scores uneven ratios of pixels", () => {
			const canvas = new QrCanvas({ height: 10, width: 10, outOfBoundsBehavior: "ignore" });
			canvas.reset();

			for (let i = 0; i < 43; i++) {
				canvas.data[i] = 1;
			}

			const result = canvas.getPenaltyScoreForRatio();
			expect(result).toEqual(10);
		});
	});
	describe("getBestMask", () => {
		it("should get best mask", () => {
			const canvas = new QrCanvas({ height: 10, width: 10 });
			canvas.reset();

			const result = canvas.getBestMask();
			expect(result).toEqual(0);
		});
	});
	//All values are +2 because it's non-masked values
	describe("drawFormatString", () => {
		it("should draw the top left format string", () => {
			const canvas = QrCanvas.fromVersion(1);
			canvas.reset();

			canvas.drawFormatString([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

			expect(canvas.getPixel(0, 8)).toEqual(2);
			expect(canvas.getPixel(1, 8)).toEqual(3);
			expect(canvas.getPixel(2, 8)).toEqual(4);
			expect(canvas.getPixel(3, 8)).toEqual(5);
			expect(canvas.getPixel(4, 8)).toEqual(6);
			expect(canvas.getPixel(5, 8)).toEqual(7);
			expect(canvas.getPixel(7, 8)).toEqual(8);
			expect(canvas.getPixel(8, 8)).toEqual(9);
			expect(canvas.getPixel(8, 7)).toEqual(10);
			expect(canvas.getPixel(8, 5)).toEqual(11);
			expect(canvas.getPixel(8, 4)).toEqual(12);
			expect(canvas.getPixel(8, 3)).toEqual(13);
			expect(canvas.getPixel(8, 2)).toEqual(14);
			expect(canvas.getPixel(8, 1)).toEqual(15);
			expect(canvas.getPixel(8, 0)).toEqual(16);
		});
		it("should draw the bottom left part of format string", () => {
			const canvas = QrCanvas.fromVersion(1);
			canvas.reset();

			canvas.drawFormatString([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

			expect(canvas.getPixel(8, 20)).toEqual(2);
			expect(canvas.getPixel(8, 19)).toEqual(3);
			expect(canvas.getPixel(8, 18)).toEqual(4);
			expect(canvas.getPixel(8, 17)).toEqual(5);
			expect(canvas.getPixel(8, 16)).toEqual(6);
			expect(canvas.getPixel(8, 15)).toEqual(7);
			expect(canvas.getPixel(8, 14)).toEqual(8);
		});
		it("should draw the top right part of format string", () => {
			const canvas = QrCanvas.fromVersion(1);
			canvas.reset();

			canvas.drawFormatString([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

			expect(canvas.getPixel(13, 8)).toEqual(9);
			expect(canvas.getPixel(14, 8)).toEqual(10);
			expect(canvas.getPixel(15, 8)).toEqual(11);
			expect(canvas.getPixel(16, 8)).toEqual(12);
			expect(canvas.getPixel(17, 8)).toEqual(13);
			expect(canvas.getPixel(18, 8)).toEqual(14);
			expect(canvas.getPixel(19, 8)).toEqual(15);
			expect(canvas.getPixel(20, 8)).toEqual(16);
		});
	});
	describe("drawVersionString", () => {
		it("should draw lower-left string", () => {
			const version = 7;
			const canvas = QrCanvas.fromVersion(version);
			canvas.reset();

			canvas.drawVersionString([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
			
			expect(canvas.getPixel(5, 36)).toEqual(2);
			expect(canvas.getPixel(5, 35)).toEqual(3);
			expect(canvas.getPixel(5, 34)).toEqual(4);
			expect(canvas.getPixel(4, 36)).toEqual(5);
			expect(canvas.getPixel(4, 35)).toEqual(6);
			expect(canvas.getPixel(4, 34)).toEqual(7);
			expect(canvas.getPixel(3, 36)).toEqual(8);
			expect(canvas.getPixel(3, 35)).toEqual(9);
			expect(canvas.getPixel(3, 34)).toEqual(10);
			expect(canvas.getPixel(2, 36)).toEqual(11);
			expect(canvas.getPixel(2, 35)).toEqual(12);
			expect(canvas.getPixel(2, 34)).toEqual(13);
			expect(canvas.getPixel(1, 36)).toEqual(14);
			expect(canvas.getPixel(1, 35)).toEqual(15);
			expect(canvas.getPixel(1, 34)).toEqual(16);
			expect(canvas.getPixel(0, 36)).toEqual(17);
			expect(canvas.getPixel(0, 35)).toEqual(18);
			expect(canvas.getPixel(0, 34)).toEqual(19);
		});
		it("should draw upper-left string", () => {
			const version = 7;
			const canvas = QrCanvas.fromVersion(version);
			canvas.reset();

			canvas.drawVersionString([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);

			expect(canvas.getPixel(36, 5)).toEqual(2);
			expect(canvas.getPixel(35, 5)).toEqual(3);
			expect(canvas.getPixel(34, 5)).toEqual(4);
			expect(canvas.getPixel(36, 4)).toEqual(5);
			expect(canvas.getPixel(35, 4)).toEqual(6);
			expect(canvas.getPixel(34, 4)).toEqual(7);
			expect(canvas.getPixel(36, 3)).toEqual(8);
			expect(canvas.getPixel(35, 3)).toEqual(9);
			expect(canvas.getPixel(34, 3)).toEqual(10);
			expect(canvas.getPixel(36, 2)).toEqual(11);
			expect(canvas.getPixel(35, 2)).toEqual(12);
			expect(canvas.getPixel(34, 2)).toEqual(13);
			expect(canvas.getPixel(36, 1)).toEqual(14);
			expect(canvas.getPixel(35, 1)).toEqual(15);
			expect(canvas.getPixel(34, 1)).toEqual(16);
			expect(canvas.getPixel(36, 0)).toEqual(17);
			expect(canvas.getPixel(35, 0)).toEqual(18);
			expect(canvas.getPixel(34, 0)).toEqual(19);
		});
	});
	describe("printMasked", () => {
		it("should print masked", () => {
			const canvas = new QrCanvas({ height: 3, width: 3, outOfBoundsBehavior: "ignore" });
			canvas.reset();
			canvas.applyMask(masks[0]);

			const result = canvas.printMasked();
			expect(result).toEqual(`true,false,true\nfalse,true,false\ntrue,false,true`);
		});
	});
});
