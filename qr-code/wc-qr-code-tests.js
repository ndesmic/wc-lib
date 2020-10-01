import { arrayChunk, getMode, encodeNumeric, encodeAlphaNumeric, toBinary, fromBinary, encodeBytes, encodePayloadWithModeAndLength, getVersionFor, getCharacterCountLength, getCharacterCount, getBitSizeForCode, addTerminalPadding, byteAlignData, createPadBytes, groupBlocks, encodePayloadWithPadding, byteToDec, getMessagePolynomial, getErrorCodeWords, interleaveBlocks, errorEncodeBlocks, errorEncodePaddedPayload, getVersionDimensions, createQrMatrix, matrixToCanvas, addDataToQrMatrix, encode } from "./wc-qr-code.js";

const bin = str => 
	str[0].split("").filter(x => !/\s|\n|_/g.test(x)).map(x => parseInt(x));

describe("getMode", () => {
	it("gets numeric mode", () =>{
		expect(getMode("123")).toBe("numeric");
	});
	it("gets alphanumeric", () => {
		expect(getMode("123ABC")).toBe("alphanumeric");
	});
	it("gets byte", () => {
		expect(getMode("http://foo#bar")).toBe("byte");
	});
});

describe("toBinary", () => {
	[
		[1, bin`1`],
		[2, bin`10`],
		[3, bin`11`],
		[4, bin`100`],
		[5, bin`101`],
		[6, bin`110`],
		[7, bin`111`],
		[8, bin`1000`],
		[9, bin`1001`],
		[10, bin`1010`],
		[530, bin`1000010010`]
	]
	.forEach(test => it(`should convert ${test[0]} to binary`, () => {
		expect(toBinary(test[0])).toEqual(test[1]);
	}));
});

describe("fromBinary", () => {
	[
		[bin`1`, 1],
		[bin`10`, 2],
		[bin`11`, 3],
		[bin`100`, 4],
		[bin`101`, 5],
		[bin`110`, 6],
		[bin`111`, 7],
		[bin`1000`, 8],
		[bin`1001`, 9],
		[bin`1010`, 10],
		[bin`1000010010`, 530]
	]
		.forEach(test => it(`should convert ${test[0]} to binary`, () => {
			expect(fromBinary(test[0])).toEqual(test[1]);
		}));
});

describe("byteToDec", () => {
	[
		[[0, 0, 0, 0, 0, 0, 0, 0], 0],
		[[0, 0, 0, 0, 0, 0, 0, 1], 1],
		[[0, 0, 0, 0, 0, 0, 1, 0], 2],
		[[0, 0, 0, 0, 0, 1, 0, 0], 4],
		[[0, 0, 0, 0, 1, 0, 0, 0], 8],
		[[0, 0, 0, 1, 0, 0, 0, 0], 16],
		[[0, 0, 1, 0, 0, 0, 0, 0], 32],
		[[0, 1, 0, 1, 1, 0, 1, 1], 91]
	].forEach(test =>
		it(`Converts ${test[0]} array to ${test[1]}`, () => {
			expect(byteToDec(test[0])).toBe(test[1]);
		}));
});

describe("arrayChunk", () => {
	it("chunks array", () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(arrayChunk(array, 3)).toEqual([
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
			[10]
		]);
	});
});

describe("getVersionDimensions", () => {
		[
			[1, 21],
			[2, 25],
			[40, 177]
		].forEach(test => 
			it(`gets version dimensions for version ${test[0]}`, () => {
				expect(getVersionDimensions(test[0])).toBe(test[1]);
			})
	);
});

describe("encodeNumeric", () => {
	it("encodes numeric", () => {
		expect(encodeNumeric(8675309))
			.toEqual(bin`110110001110000100101001`);
	});
});

describe("encodeAlphaNumeric", () => {
	it("encodes alphanumeric", () => {
		expect(encodeAlphaNumeric("HELLO WORLD"))
			.toEqual(bin`0110000101101111000110100010111001011011100010011010100001101`);
	});
});

describe("encodeBytes", () => {
	it("encodes bytes", () => {
		expect(encodeBytes("Hello, world!"))
			.toEqual(bin`01001000011001010110110001101100011011110010110000100000011101110110111101110010011011000110010000100001`);
	});
});

describe("getVersionFor", () => {
	[
		[11, "alphanumeric", "Q", 1],
		[255, "binary", "H", 17],
		[1000, "numeric", "L", 13]
	]
		.forEach(test => it(`should get version ${test[3]} for ${test[0]},${test[1]},${test[2]}`, () =>
			expect(getVersionFor(test[0], test[1], test[2])).toBe(test[3]))
		);
});

describe("groupBlocks", () => {
	it("chunks the blocks", () => {
		const data = bin`
		01000011
		01010101
		01000110
		10000110
		01010111
		00100110
		01010101
		11000010
		01110111
		00110010
		00000110
		00010010
		00000110
		01100111
		00100110
		11110110
		11110110
		01000010
		00000111
		01110110
		10000110
		11110010
		00000111
		00100110
		01010110
		00010110
		11000110
		11000111
		10010010
		00000110
		10110110
		11100110
		11110111
		01110111
		00110010
		00000111
		01110110
		10000110
		01010111
		00100110
		01010010
		00000110
		10000110
		10010111
		00110010
		00000111
		01000110
		11110111
		01110110
		01010110
		11000010
		00000110
		10010111
		00110010
		11100000
		11101100
		00010001
		11101100
		00010001
		11101100
		00010001
		11101100`;
		const groups = groupBlocks(data, 5, "Q");
		expect(groups[0][0]).toEqual([
			bin`01000011`,
			bin`01010101`,
			bin`01000110`,
			bin`10000110`,
			bin`01010111`,
			bin`00100110`,
			bin`01010101`,
			bin`11000010`,
			bin`01110111`,
			bin`00110010`,
			bin`00000110`,
			bin`00010010`,
			bin`00000110`,
			bin`01100111`,
			bin`00100110`
		]);
		expect(groups[0][1]).toEqual([
			bin`11110110`,
			bin`11110110`,
			bin`01000010`,
			bin`00000111`,
			bin`01110110`,
			bin`10000110`,
			bin`11110010`,
			bin`00000111`,
			bin`00100110`,
			bin`01010110`,
			bin`00010110`,
			bin`11000110`,
			bin`11000111`,
			bin`10010010`,
			bin`00000110`
		]);
		expect(groups[1][0]).toEqual([
			bin`10110110`,
			bin`11100110`,
			bin`11110111`,
			bin`01110111`,
			bin`00110010`,
			bin`00000111`,
			bin`01110110`,
			bin`10000110`,
			bin`01010111`,
			bin`00100110`,
			bin`01010010`,
			bin`00000110`,
			bin`10000110`,
			bin`10010111`,
			bin`00110010`,
			bin`00000111`
		]);
		expect(groups[1][1]).toEqual([
			bin`01000110`,
			bin`11110111`,
			bin`01110110`,
			bin`01010110`,
			bin`11000010`,
			bin`00000110`,
			bin`10010111`,
			bin`00110010`,
			bin`11100000`,
			bin`11101100`,
			bin`00010001`,
			bin`11101100`,
			bin`00010001`,
			bin`11101100`,
			bin`00010001`,
			bin`11101100`
		]);
	});
});

describe("getCharacterCountLength", () => {
	[
		[2, "numeric", 10],
		[1, "alphanumeric", 9],
		[5, "byte", 8],
		[17, "numeric", 12],
		[19, "alphanumeric", 11],
		[15, "byte", 16],
		[40, "numeric", 14],
		[33, "alphanumeric", 13],
		[35, "byte", 16]
	]
		.forEach(test => it(`should get length ${test[2]} for ${test[0]},${test[1]}`, () =>
			expect(getCharacterCountLength(test[0], test[1])).toBe(test[2]))
		);
});

describe("getCharacterCount", () => {
	[
		[1, "alphanumeric", 11, "000001011"]
	]
		.forEach(test => it(`should get length ${test[3]} for ${test[0]},${test[1]},${test[2]}`, () =>
			expect(getCharacterCount(test[0], test[1], test[2]).join("")).toBe(test[3]))
		);
});

describe("getBitSizeForCode", () => {
	[
		[1, "Q", 13*8],
		[5, "L", 108*8],
		[8, "H", 86*8],
		[13, "M", 334*8],
		[24, "Q", 664*8],
		[27, "L", 1468*8],
		[32, "H", 845*8],
		[36, "M", 1914*8],
		[39, "Q", 1582*8],
		[40, "L", 2956*8]
	]
		.forEach(test => it(`should get length ${test[2]} for ${test[0]},${test[1]}}`, () =>
			expect(getBitSizeForCode(test[0], test[1])).toBe(test[2]))
		);
});

describe("addTerminalPadding", () => {
	[
		[bin`1111111111`, 10, bin`1111111111`],
		[bin`1111111111`, 12, bin`111111111100`],
		[bin`1111111111`, 14, bin`11111111110000`],
		[bin`1111111111`, 16, bin`11111111110000`]
	]
		.forEach(test => it(`should get value ${test[2]} for ${test[0]},${test[1]}}`, () =>
			expect(addTerminalPadding(test[0], test[1])).toEqual(test[2]))
		);
});

describe("byteAlignData", () => {
	[
		[[1], [1,0,0,0,0,0,0,0]],
		[[1, 1], [1, 1, 0, 0, 0, 0, 0, 0]],
		[[1,1,1], [1, 1, 1, 0, 0, 0, 0, 0]],
		[[1,1,1,1], [1, 1, 1, 1, 0, 0, 0, 0]],
		[[1,1,1,1,1], [1, 1, 1, 1, 1, 0, 0, 0]],
		[[1,1,1,1,1,1], [1, 1, 1, 1, 1, 1, 0, 0]],
		[[1,1,1,1,1,1,1], [1, 1, 1, 1, 1, 1, 1, 0]],
		[[1,1,1,1,1,1,1,1], [1, 1, 1, 1, 1, 1, 1, 1]]
	]
		.forEach(test => it(`should byte align ${test[0]}`, () => {
			byteAlignData(test[0]);
			expect(test[1]).toEqual(test[1]);
		}));
});

describe("createPadBytes", () => {
	[
		[0, []],
		[1, bin`11101100`],
		[2, bin`1110110000010001`],
		[3, bin`111011000001000111101100`]
	]
		.forEach(test => it(`should create pad bytes ${test[0]}`, () =>
			expect(createPadBytes(test[0])).toEqual(test[1])
		));
});

describe("encodePayloadWithModeAndLength", () => {
	[
		["HELLO WORLD", "alphanumeric", 1, bin`00100000010110110000101101111000110100010111001011011100010011010100001101`]
	]
		.forEach(test => it(`should get value ${test[3]} for ${test[0]},${test[1]},${test[2]}`, () =>
			expect(encodePayloadWithModeAndLength(test[0], test[1], test[2])).toEqual(test[3]))
		);
});

describe("encodePayloadWithPadding", () => {
	[
		["HELLO WORLD", "alphanumeric", 1, "M", bin`00100000_01011011_00001011_01111000_11010001_01110010_11011100_01001101_01000011_01000000_11101100_00010001_11101100_00010001_11101100_00010001`],
		["QR CODES", "alphanumeric", 1, "M", bin`00100000_01000100_10101101_11001100_00010001_00010101_01001001_00000000_11101100_00010001_11101100_00010001_11101100_00010001_11101100_00010001`]
	]
		.forEach(test => it(`should get value ${test[4]} for ${test[0]},${test[1]},${test[2]},${test[3]}`, () =>
			expect(encodePayloadWithPadding(test[0], test[1], test[2], test[3])).toEqual(test[4]))
		);
});

describe("getMessagePolynomial", () => {
	it("gets coefficents for message polynomial", () => {
		const result = getMessagePolynomial(bin`
			00100000
			01011011
			00001011
			01111000
			11010001
			01110010
			11011100
			01001101
			01000011
			01000000
			11101100
			00010001
			11101100
			00010001
			11101100
			00010001`);
		expect(result).toEqual([
			32,
			91,
			11,
			120,
			209,
			114,
			220,
			77,
			67,
			64,
			236,
			17,
			236,
			17,
			236,
			17
		]);
	});
});

//https://www.thonky.com/qr-code-tutorial/structure-final-message
describe("getErrorCodeWords", () => {
	[
		[
			[32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17],
			1,
			"M",
			[196, 35, 39, 119, 235, 215, 231, 226, 93, 23]
		],
		[
			[67, 85, 70, 134, 87, 38, 85, 194, 119, 50, 6, 18, 6, 103, 38],
			5,
			"Q",
			[213, 199, 11, 45, 115, 247, 241, 223, 229, 248, 154, 117, 154, 111, 86, 161, 111, 39]
		],
		[
			[246, 246, 66, 7, 118, 134, 242, 7, 38, 86, 22, 198, 199, 146, 6],
			5,
			"Q",
			[87, 204, 96, 60, 202, 182, 124, 157, 200, 134, 27, 129, 209, 17, 163, 163, 120, 133]
		]
	].forEach(([codewords, version, ec, result]) => 
		it("should get error codewords", () => {
			const ecCodewords = getErrorCodeWords(
				codewords,
				version,
				ec
			);
			expect(ecCodewords).toEqual(result);
		}));
});

describe("interleaveBlocks", () => {
	it("should interleave blocks", () => {
		const groups = [
			[
				[
					bin`01000011`,
					bin`01010101`,
					bin`01000110`,
					bin`10000110`,
					bin`01010111`,
					bin`00100110`,
					bin`01010101`,
					bin`11000010`,
					bin`01110111`,
					bin`00110010`,
					bin`00000110`,
					bin`00010010`,
					bin`00000110`,
					bin`01100111`,
					bin`00100110`
				],
				[
					bin`11110110`,
					bin`11110110`,
					bin`01000010`,
					bin`00000111`,
					bin`01110110`,
					bin`10000110`,
					bin`11110010`,
					bin`00000111`,
					bin`00100110`,
					bin`01010110`,
					bin`00010110`,
					bin`11000110`,
					bin`11000111`,
					bin`10010010`,
					bin`00000110`
				]
			],
			[
				[
					bin`10110110`,
					bin`11100110`,
					bin`11110111`,
					bin`01110111`,
					bin`00110010`,
					bin`00000111`,
					bin`01110110`,
					bin`10000110`,
					bin`01010111`,
					bin`00100110`,
					bin`01010010`,
					bin`00000110`,
					bin`10000110`,
					bin`10010111`,
					bin`00110010`,
					bin`00000111`
				],
				[
					bin`01000110`,
					bin`11110111`,
					bin`01110110`,
					bin`01010110`,
					bin`11000010`,
					bin`00000110`,
					bin`10010111`,
					bin`00110010`,
					bin`00010000`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`
				]
			]
		];

		const result = interleaveBlocks(groups);
		const expected = [
				bin`01000011`,
				bin`11110110`,
				bin`10110110`,
				bin`01000110`,
				bin`01010101`,
				bin`11110110`,
				bin`11100110`,
				bin`11110111`,
				bin`01000110`,
				bin`01000010`,
				bin`11110111`,
				bin`01110110`,
				bin`10000110`,
				bin`00000111`,
				bin`01110111`,
				bin`01010110`,
				bin`01010111`,
				bin`01110110`,
				bin`00110010`,
				bin`11000010`,
				bin`00100110`,
				bin`10000110`,
				bin`00000111`,
				bin`00000110`,
				bin`01010101`,
				bin`11110010`,
				bin`01110110`,
				bin`10010111`,
				bin`11000010`,
				bin`00000111`,
				bin`10000110`,
				bin`00110010`,
				bin`01110111`,
				bin`00100110`,
				bin`01010111`,
				bin`00010000`,
				bin`00110010`,
				bin`01010110`,
				bin`00100110`,
				bin`11101100`,
				bin`00000110`,
				bin`00010110`,
				bin`01010010`,
				bin`00010001`,
				bin`00010010`,
				bin`11000110`,
				bin`00000110`,
				bin`11101100`,
				bin`00000110`,
				bin`11000111`,
				bin`10000110`,
				bin`00010001`,
				bin`01100111`,
				bin`10010010`,
				bin`10010111`,
				bin`11101100`,
				bin`00100110`,
				bin`00000110`,
				bin`00110010`,
				bin`00010001`,
				bin`00000111`,
				bin`11101100`
		];

		expect(result).toEqual(expected);
	});
});

describe("errorEncodeBlocks", () => {
	it("should interleave blocks", () => {
		const groups = [
			[
				[
					bin`01000011`,
					bin`01010101`,
					bin`01000110`,
					bin`10000110`,
					bin`01010111`,
					bin`00100110`,
					bin`01010101`,
					bin`11000010`,
					bin`01110111`,
					bin`00110010`,
					bin`00000110`,
					bin`00010010`,
					bin`00000110`,
					bin`01100111`,
					bin`00100110`
				],
				[
					bin`11110110`,
					bin`11110110`,
					bin`01000010`,
					bin`00000111`,
					bin`01110110`,
					bin`10000110`,
					bin`11110010`,
					bin`00000111`,
					bin`00100110`,
					bin`01010110`,
					bin`00010110`,
					bin`11000110`,
					bin`11000111`,
					bin`10010010`,
					bin`00000110`
				]
			],
			[
				[
					bin`10110110`,
					bin`11100110`,
					bin`11110111`,
					bin`01110111`,
					bin`00110010`,
					bin`00000111`,
					bin`01110110`,
					bin`10000110`,
					bin`01010111`,
					bin`00100110`,
					bin`01010010`,
					bin`00000110`,
					bin`10000110`,
					bin`10010111`,
					bin`00110010`,
					bin`00000111`
				],
				[
					bin`01000110`,
					bin`11110111`,
					bin`01110110`,
					bin`01010110`,
					bin`11000010`,
					bin`00000110`,
					bin`10010111`,
					bin`00110010`,
					bin`00010000`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`,
					bin`00010001`,
					bin`11101100`
				]
			]
		];

		const ecBlocks = errorEncodeBlocks(groups, 5, "Q");

		expect(ecBlocks[0][0]).toEqual([
			bin`11010101`,
			bin`11000111`,
			bin`00001011`,
			bin`00101101`,
			bin`01110011`,
			bin`11110111`,
			bin`11110001`,
			bin`11011111`,
			bin`11100101`,
			bin`11111000`,
			bin`10011010`,
			bin`01110101`,
			bin`10011010`,
			bin`01101111`,
			bin`01010110`,
			bin`10100001`,
			bin`01101111`,
			bin`00100111`
		]);

		expect(ecBlocks[0][1]).toEqual([
			bin`01010111`,
			bin`11001100`,
			bin`01100000`,
			bin`00111100`,
			bin`11001010`,
			bin`10110110`,
			bin`01111100`,
			bin`10011101`,
			bin`11001000`,
			bin`10000110`,
			bin`00011011`,
			bin`10000001`,
			bin`11010001`,
			bin`00010001`,
			bin`10100011`,
			bin`10100011`,
			bin`01111000`,
			bin`10000101`
		]);

		expect(ecBlocks[1][0]).toEqual([
			bin`10010100`,
			bin`01110100`,
			bin`10110001`,
			bin`11010100`,
			bin`01001100`,
			bin`10000101`,
			bin`01001011`,
			bin`11110010`,
			bin`11101110`,
			bin`01001100`,
			bin`11000011`,
			bin`11100110`,
			bin`10111101`,
			bin`00001010`,
			bin`01101100`,
			bin`11110000`,
			bin`11000000`,
			bin`10001101`
		]);


		expect(ecBlocks[1][1]).toEqual([
			bin`11101011`,
			bin`10011111`,
			bin`00000101`,
			bin`10101101`,
			bin`00011000`,
			bin`10010011`,
			bin`00111011`,
			bin`00100001`,
			bin`01101010`,
			bin`00101000`,
			bin`11111111`,
			bin`10101100`,
			bin`01010010`,
			bin`00000010`,
			bin`10000011`,
			bin`00100000`,
			bin`10110010`,
			bin`11101100`
		]);
	});
});

describe("errorEncodePaddedPayload", () => {
	it("should error encoded the padded payload", () => {
		const data = bin`
		01000011
		01010101
		01000110
		10000110
		01010111
		00100110
		01010101
		11000010
		01110111
		00110010
		00000110
		00010010
		00000110
		01100111
		00100110
		11110110
		11110110
		01000010
		00000111
		01110110
		10000110
		11110010
		00000111
		00100110
		01010110
		00010110
		11000110
		11000111
		10010010
		00000110
		10110110 
		11100110
		11110111
		01110111
		00110010
		00000111
		01110110
		10000110
		01010111
		00100110
		01010010
		00000110
		10000110
		10010111
		00110010
		00000111
		01000110 
		11110111
		01110110
		01010110
		11000010
		00000110
		10010111
		00110010
		00010000
		11101100
		00010001
		11101100
		00010001
		11101100
		00010001
		11101100`;
		const errorEncodedPayload = errorEncodePaddedPayload(data, 5, "Q");

		expect(errorEncodedPayload).toEqual(
			bin`
			01000011
			11110110
			10110110
			01000110
			01010101
			11110110
			11100110
			11110111
			01000110
			01000010
			11110111
			01110110
			10000110
			00000111
			01110111
			01010110
			01010111
			01110110
			00110010
			11000010
			00100110
			10000110
			00000111
			00000110
			01010101
			11110010
			01110110
			10010111
			11000010
			00000111
			10000110
			00110010
			01110111
			00100110
			01010111
			00010000
			00110010
			01010110
			00100110
			11101100
			00000110
			00010110
			01010010
			00010001
			00010010
			11000110
			00000110
			11101100
			00000110
			11000111
			10000110
			00010001
			01100111
			10010010
			10010111
			11101100
			00100110
			00000110
			00110010
			00010001
			00000111
			11101100
			11010101
			01010111
			10010100
			11101011
			11000111
			11001100
			01110100
			10011111
			00001011
			01100000
			10110001
			00000101
			00101101
			00111100
			11010100
			10101101
			01110011
			11001010
			01001100
			00011000
			11110111
			10110110
			10000101
			10010011
			11110001
			01111100
			01001011
			00111011
			11011111
			10011101
			11110010
			00100001
			11100101
			11001000
			11101110
			01101010
			11111000
			10000110
			01001100
			00101000
			10011010
			00011011
			11000011
			11111111
			01110101
			10000001
			11100110
			10101100
			10011010
			11010001
			10111101
			01010010
			01101111
			00010001
			00001010
			00000010
			01010110
			10100011
			01101100
			10000011
			10100001
			10100011
			11110000
			00100000
			01101111
			01111000
			11000000
			10110010
			00100111
			10000101
			10001101
			11101100
			0000000
			`);
	});
});

describe("createQrMatix", () => {
	it("should create QR matrix", () => {
		const matrix = createQrMatrix(1);
		const canvas = matrixToCanvas(matrix);
		canvas.style.width = "320px";
		canvas.style.height = "320px";
		canvas.style.imageRendering = "pixelated";
		canvas.style.margin = "20px";
		document.body.appendChild(canvas);
	});
	it("should create QR matrix", () => {
		const matrix = createQrMatrix(8);
		const canvas = matrixToCanvas(matrix);
		canvas.style.width = "320px";
		canvas.style.height = "320px";
		canvas.style.imageRendering = "pixelated";
		canvas.style.margin = "20px";
		document.body.appendChild(canvas);
	});
});

fdescribe("addDataToQrMatrix", () => {
	it("should create QR matrix", () => {
		const payload = encode("HELLO WORLD", "Q")
		const matrix = createQrMatrix(1);
		addDataToQrMatrix(matrix, payload);
		const canvas = matrixToCanvas(matrix);
		canvas.style.width = "320px";
		canvas.style.height = "320px";
		canvas.style.imageRendering = "pixelated";
		canvas.style.margin = "20px";
		document.body.appendChild(canvas);
	});
});