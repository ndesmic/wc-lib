import { drawQrCanvas } from "./canvas-utils.js";
import { GaloisField } from "./galois-field.js";
import { QrCanvas, masks } from "./qr-canvas.js";
import { chunkArray, trimArrayStart } from "./utils.js";
import { padArrayEnd, padArrayStart } from "../../libs/array-utils.js";

/**
 * @typedef {("numeric"|"alphanumeric"|"binary")} mode
 * @typedef {("L"|"M"|"Q"|"H")} errorCorrectionLevel
 */

//TODO fill in versions 20-40
export const versionCapabilities = {
	"numeric": {
		"L": [41, 77, 127, 187, 255, 322, 370, 461, 552, 652, 772, 883, 1022, 1101, 1250, 1408, 1548, 1725, 1903, 2061, 2232, 2409],
		"M": [34, 63, 101, 149, 202, 255, 293, 365, 432, 513, 604, 691, 796, 871, 991, 1082, 1212, 1346, 1500, 1600, 1708, 1872],
		"Q": [27, 48, 77, 111, 144, 178, 207, 259, 312, 364, 427, 489, 580, 621, 703, 775, 876, 948, 1063, 1159, 1224, 1358],
		"H": [17, 34, 58, 82, 106, 139, 154, 202, 235, 288, 331, 374, 427, 468, 530, 602, 674, 746, 813, 919, 969, 1056]
	},
	"alphanumeric": {
		"L": [25, 47, 77, 114, 154, 195, 224, 279, 335, 395, 468, 535, 619, 667, 758, 854, 938, 1046, 1153, 1249, 1352, 1460],
		"M": [20, 38, 61, 90, 122, 154, 178, 221, 262, 311, 366, 419, 483, 528, 600, 656, 734, 816, 909, 970, 1035, 1134],
		"Q": [16, 29, 47, 67, 87, 108, 125, 157, 189, 221, 259, 296, 352, 376, 426, 470, 531, 574, 644, 702, 742, 823],
		"H": [10, 20, 35, 50, 64, 84, 93, 122, 143, 174, 200, 227, 259, 283, 321, 365, 408, 452, 493, 557, 587, 640]
	},
	"binary": {
		"L": [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003],
		"M": [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779],
		"Q": [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565],
		"H": [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439]
	}
};

export const versionRemainderBits = [null, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0];

//Table is organized [EC Codewords per block] [# of blocks in Group 1] [Data Codewords per block in Group 1] [# of blocks in Group 2] [Data Codewords per block in Group 2]
export const errorCorrectionTable = {
	"L": [[7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0], [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69], [20, 4, 81, 0, 0], [24, 2, 92, 2, 93], [26, 4, 107, 0, 0], [30, 3, 115, 1, 116], [22, 5, 87, 1, 88], [24, 5, 98, 1, 99], [28, 1, 107, 5, 108], [30, 5, 120, 1, 121], [28, 3, 113, 4, 114], [28, 3, 107, 5, 108], [28, 4, 116, 4, 117], [28, 2, 111, 7, 112], [30, 4, 121, 5, 122], [30, 6, 117, 4, 118], [26, 8, 106, 4, 107], [28, 10, 114, 2, 115], [30, 8, 122, 4, 123], [30, 3, 117, 10, 118], [30, 7, 116, 7, 117], [30, 5, 115, 10, 116], [30, 13, 115, 3, 116], [30, 17, 115, 0, 0], [30, 17, 115, 1, 116], [30, 13, 115, 6, 116], [30, 12, 121, 7, 122], [30, 6, 121, 14, 122], [30, 17, 122, 4, 123], [30, 4, 122, 18, 123], [30, 20, 117, 4, 118], [30, 19, 118, 6, 119]],
	"M": [[10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0], [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44], [30, 1, 50, 4, 51], [22, 6, 36, 2, 37], [22, 8, 37, 1, 38], [24, 4, 40, 5, 41], [24, 5, 41, 5, 42], [28, 7, 45, 3, 46], [28, 10, 46, 1, 47], [26, 9, 43, 4, 44], [26, 3, 44, 11, 45], [26, 3, 41, 13, 42], [26, 17, 42, 0, 0], [28, 17, 46, 0, 0], [28, 4, 47, 14, 48], [28, 6, 45, 14, 46], [28, 8, 47, 13, 48], [28, 19, 46, 4, 47], [28, 22, 45, 3, 46], [28, 3, 45, 23, 46], [28, 21, 45, 7, 46], [28, 19, 47, 10, 48], [28, 2, 46, 29, 47], [28, 10, 46, 23, 47], [28, 14, 46, 21, 47], [28, 14, 46, 23, 47], [28, 12, 47, 26, 48], [28, 6, 47, 34, 48], [28, 29, 46, 14, 47], [28, 13, 46, 32, 47], [28, 40, 47, 7, 48], [28, 18, 47, 31, 48]],
	"Q": [[13, 1, 13, 0, 0], [22, 1, 22, 0, 0], [18, 2, 17, 0, 0], [26, 2, 24, 0, 0], [18, 2, 15, 2, 16], [24, 4, 19, 0, 0], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20], [28, 4, 22, 4, 23], [26, 4, 20, 6, 21], [24, 8, 20, 4, 21], [20, 11, 16, 5, 17], [30, 5, 24, 7, 25], [24, 15, 19, 2, 20], [28, 1, 22, 15, 23], [28, 17, 22, 1, 23], [26, 17, 21, 4, 22], [30, 15, 24, 5, 25], [28, 17, 22, 6, 23], [30, 7, 24, 16, 25], [30, 11, 24, 14, 25], [30, 11, 24, 16, 25], [30, 7, 24, 22, 25], [28, 28, 22, 6, 23], [30, 8, 23, 26, 24], [30, 4, 24, 31, 25], [30, 1, 23, 37, 24], [30, 15, 24, 25, 25], [30, 42, 24, 1, 25], [30, 10, 24, 35, 25], [30, 29, 24, 19, 25], [30, 44, 24, 7, 25], [30, 39, 24, 14, 25], [30, 46, 24, 10, 25], [30, 49, 24, 10, 25], [30, 48, 24, 14, 25], [30, 43, 24, 22, 25], [30, 34, 24, 34, 25]],
	"H": [[17, 1, 9, 0, 0], [28, 1, 16, 0, 0], [22, 2, 13, 0, 0], [16, 4, 9, 0, 0], [22, 2, 11, 2, 12], [28, 4, 15, 0, 0], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15], [24, 4, 12, 4, 13], [28, 6, 15, 2, 16], [24, 3, 12, 8, 13], [28, 7, 14, 4, 15], [22, 12, 11, 4, 12], [24, 11, 12, 5, 13], [24, 11, 12, 7, 13], [30, 3, 15, 13, 16], [28, 2, 14, 17, 15], [28, 2, 14, 19, 15], [26, 9, 13, 16, 14], [28, 15, 15, 10, 16], [30, 19, 16, 6, 17], [24, 34, 13, 0, 0], [30, 16, 15, 14, 16], [30, 30, 16, 2, 17], [30, 22, 15, 13, 16], [30, 33, 16, 4, 17], [30, 12, 15, 28, 16], [30, 11, 15, 31, 16], [30, 19, 15, 26, 16], [30, 23, 15, 25, 16], [30, 23, 15, 28, 16], [30, 19, 15, 35, 16], [30, 11, 15, 46, 16], [30, 59, 16, 1, 17], [30, 22, 15, 41, 16], [30, 2, 15, 64, 16], [30, 24, 15, 46, 16], [30, 42, 15, 32, 16], [30, 10, 15, 67, 16], [30, 20, 15, 61, 16]]
};

const errorCorrectionBits = {
	L: [0, 1],
	M: [0, 0],
	Q: [1, 1],
	H: [1, 0]
};
const maskBits = {
	0: [0, 0, 0],
	1: [0, 0, 1],
	2: [0, 1, 0],
	3: [0, 1, 1],
	4: [1, 0, 0],
	5: [1, 0, 1],
	6: [1, 1, 0],
	7: [1, 1, 1]
}

//https://www.thonky.com/qr-code-tutorial/numeric-mode-encoding
export function encodeNumeric(payload) {
	payload = typeof payload === "number"
		? payload.toString()
		: payload;
	const groupings = payload.match(/.{1,3}/g);
	const binaryGroupings = groupings.map(x => toBinary(x));
	return binaryGroupings.flat();
}
export const alphaMap = {
	0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
	A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18, J: 19,
	K: 20, L: 21, M: 22, N: 23, O: 24, P: 25, Q: 26, R: 27, S: 28, T: 29,
	U: 30, V: 31, W: 32, X: 33, Y: 34, Z: 35, " ": 36, "$": 37, "%": 38, "*": 39,
	"+": 40, "-": 41, ".": 42, "/": 43, ":": 44
}
//https://www.thonky.com/qr-code-tutorial/alphanumeric-mode-encoding
export function encodeAlphaNumeric(payload) {
	const groupings = payload.match(/.{1,2}/g);
	const binaryGroupings = groupings.map(x => {
		if (x.length === 2) {
			const num = alphaMap[x[0]] * 45 + alphaMap[x[1]];
			return padArrayStart(toBinary(num), 11, 0);
		} else {
			return padArrayStart(toBinary(alphaMap[x[0]]), 6, 0);
		}
	});
	return binaryGroupings.flat();
}
//https://www.thonky.com/qr-code-tutorial/byte-mode-encoding
//Full UTF-8 not supported by all readers but this is much easier and more flexible to output, ISO 8859-1 is a subset
export function encodeBytes(payload) {
	const textEncoder = new TextEncoder();
	const bytes = textEncoder.encode(payload);
	const array = [];
	for (let b of bytes) {
		array.push(padArrayStart(toBinary(b), 8, 0));
	}
	return array.flat();
}

/**
 * {Object.<mode,[number,number,number,number]>}
 */
const modeIndicator = {
	"numeric": [0, 0, 0, 1],
	"alphanumeric": [0, 0, 1, 0],
	"binary": [0, 1, 0, 0],
}

/**
 * 
 * @param {string} payload 
 * @returns {mode}
 */
export function getMode(payload) {
	if (/^[0-9]*$/.test(payload)) return "numeric";
	if (/^[0-9A-Z\$\%\*\+\-\.\/\:\s]*$/.test(payload)) return "alphanumeric";
	//also kanji but ranges are difficult to figure out :/
	return "binary";
}

export function toBinary(n, len) {
	function bin(n) {
		if (n > 1) {
			return [n % 2, ...bin(Math.floor(n / 2))];
		}
		return [1];
	}
	function pad(arr, len) {
		while (arr.length < len) {
			arr.push(0);
		}
		return arr;
	}
	return len && len > 0
		? pad(bin(n), len).reverse()
		: bin(n).reverse();
}
export function fromBinary(array) {
	let n = 0;
	const lastIndex = (array.length - 1);
	for (let i = 0; i < array.length; i++) {
		n = n | (array[lastIndex - i] << i);
	}
	return n;
}

/**
 * @param {number} length - The length in bytes
 * @param {mode} mode - The encoding mode
 * @param {string} errorCorrectionLevel - level level to correct for
*/
export function getVersionFor(length, mode, errorCorrectionLevel) {
	const versions = versionCapabilities[mode][errorCorrectionLevel];
	let i = 0;
	while (versions[i] !== undefined && versions[i] < length) { i++; }
	if (versions[i] === undefined) throw `Data larger than biggest possible QR code for values ${mode}, ${errorCorrectionLevel}`;
	return i + 1;
}

/**
 * 
 * @param {number} version 
 * @param {mode} mode 
 * @returns 
 */

export function getCharacterCountLength(version, mode) {
	switch (mode) {
		case "numeric": {
			if (version < 10) return 10;
			if (version >= 10 && version < 27) return 12;
			if (version >= 27 && version < 41) return 14;
		}
		case "alphanumeric":
			if (version < 10) return 9;
			if (version >= 10 && version < 27) return 11;
			if (version >= 27 && version < 41) return 13;
		case "binary":
			if (version < 10) return 8;
			if (version >= 10 && version < 41) return 16;
	}
	throw `No length defined for version:${version}, mode:${mode}`;
}
export function getCharacterCount(version, mode, length) {
	const bitLength = getCharacterCountLength(version, mode);
	return padArrayStart(toBinary(length), bitLength, 0);
}

export function getBitSizeForCode(version, errorCorrectionLevel) {
	const row = errorCorrectionTable[errorCorrectionLevel][version - 1];
	return ((row[1] * row[2]) + (row[3] * row[4])) * 8;
}

/**
 * 
 * @param {string} payload 
 * @param {mode} mode 
 * @param {number} version 
 * @returns 
 */
export function encodePayloadWithModeAndLength(payload, mode, version) {
	let encodedPayload;
	switch (mode) {
		case "numeric": { encodedPayload = encodeNumeric(payload); break; };
		case "alphanumeric": { encodedPayload = encodeAlphaNumeric(payload); break; };
		case "binary": { encodedPayload = encodeBytes(payload); break; };
	}

	const encodedLength = getCharacterCount(version, mode, payload.length);
	const encodedMode = modeIndicator[mode];
	return [encodedMode, encodedLength, encodedPayload].flat();
}

export function addTerminalPadding(encodedData, bitSize) {
	if (encodedData.length < bitSize) {
		const difference = bitSize - encodedData.length;
		if (difference < 4) {
			return padArrayEnd(encodedData, bitSize, 0);
		} else if (difference >= 4) {
			return [...encodedData, 0, 0, 0, 0];
		}
	}
	return encodedData;
}

export function byteAlignData(data) {
	while (data.length % 8 !== 0) {
		data.push(0);
	}
}

export function createPadBytes(count) {
	const result = [];
	for (let i = 0; i < count; i++) {
		const mod = (i % 2);
		result.push(...(mod === 0 ? [1, 1, 1, 0, 1, 1, 0, 0] : [0, 0, 0, 1, 0, 0, 0, 1]));
	}
	return result;
}

/**
 * 
 * @param {string} payload 
 * @param {errorCorrectionLevel} errorCorrectionLevel 
 * @returns {{ encodedData: number[], version: number, mode: mode }}
 */
export function qrEncodeData(payload, errorCorrectionLevel) {
	const mode = getMode(payload);
	const version = getVersionFor(payload.length, mode, errorCorrectionLevel);
	const paddedPayload = encodePayloadWithPadding(payload, mode, version, errorCorrectionLevel);
	return {
		encodedData: errorEncodePaddedPayload(paddedPayload, version, errorCorrectionLevel),
		version,
		mode
	};
}

//gets encoding for data and pads
export function encodePayloadWithPadding(payload, mode, version, errorCorrectionLevel) {
	const encodedData = encodePayloadWithModeAndLength(payload, mode, version, errorCorrectionLevel);
	const bitSize = getBitSizeForCode(version, errorCorrectionLevel);
	const terminatedEncodedData = addTerminalPadding(encodedData, bitSize);
	byteAlignData(terminatedEncodedData);
	const bytesToPad = (bitSize / 8) - (terminatedEncodedData.length / 8); //no decimals expected here
	const paddedPayload = [...terminatedEncodedData, ...createPadBytes(bytesToPad)];
	return paddedPayload;
}

export function errorEncodeBlocks(groupBlocks, version, errorCorrectionLevel) {
	const ecGroups = [];
	for (let g = 0; g < groupBlocks.length; g++) {
		const ecGroup = [];
		for (let b = 0; b < groupBlocks[g].length; b++) {
			const codewords = groupBlocks[g][b].map(x => fromBinary(x));
			ecGroup.push(getErrorCodeWords(codewords, version, errorCorrectionLevel).map(x => toBinary(x, 8)));
		}
		ecGroups.push(ecGroup);
	}
	return ecGroups;
}

//At this point the exact length of data will be correct
export function groupBlocks(data, version, errorCorrectionLevel) {
	const errorCorrectionBlocks = errorCorrectionTable[errorCorrectionLevel][version - 1];
	const totalGroup1Blocks = errorCorrectionBlocks[1] * errorCorrectionBlocks[2];
	let group1 = chunkArray(data.slice(0, (totalGroup1Blocks * 8)), 8);
	let group2 = chunkArray(data.slice((totalGroup1Blocks * 8)), 8);
	const result = [];

	if (errorCorrectionBlocks[1] > 0) { //number of block in group 1 > 0 (always true)
		result.push(chunkArray(group1, errorCorrectionBlocks[2])); //codewords per block
	}
	if (errorCorrectionBlocks[3] > 0) { //number of blocks in group 2 > 0
		result.push(chunkArray(group2, errorCorrectionBlocks[4])); //codeword per block
	}
	return result;
}

export function byteToDec(bin) {
	let result = 0;
	for (let i = 0; i < bin.length; i++) {
		result = result | bin[i] << (7 - i);
	}
	return result;
}

export function getMessagePolynomial(data) {
	const result = [];
	for (let i = 0; i < data.length; i += 8) {
		result.push(byteToDec(data.slice(i, i + 8)));
	}
	return result;
}

export function getErrorCodeWords(messagePolynomial, version, errorCorrectionLevel) {
	const gf = new GaloisField();
	const group1Blocks = errorCorrectionTable[errorCorrectionLevel][version - 1][0];
	const paddedMessagePoly = [...messagePolynomial, ...new Array(group1Blocks).fill(0)];
	const generatorPoly = gf.getGeneratorPoly(group1Blocks);
	const [_, remain] = gf.polyDiv(paddedMessagePoly, generatorPoly);
	return remain;
}

export function interleaveBlocks(groups) {
	const result = [];
	const maxBlockLength = Math.max(groups[0][0].length, groups?.[1]?.[0].length ?? 0);
	for (let cw = 0; cw < maxBlockLength; cw++) {
		for (let group = 0; group < groups.length; group++) { //at most 2
			for (let block = 0; block < groups[group].length; block++) {
				if (groups[group][block][cw] !== undefined) {
					result.push(groups[group][block][cw]);
				}
			}
		}
	}
	return result;
}

/**
 * 
 * @param {errorCorrectionLevel} errorCorrectionLevel 
 * @param {number} mask 
 * @returns
 */

export function getFormatString(errorCorrectionLevel, mask) {
	const formatString = [
		...errorCorrectionBits[errorCorrectionLevel],
		...maskBits[mask]
	];
	const errorBits = getFormatErrorBits(formatString);
	const errorCorrectedFormatString = [...formatString, ...errorBits];
	const maskString = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
	return errorCorrectedFormatString.map((x, i) => x ^ maskString[i]);
}

export function getFormatErrorBits(formatString) {
	const generatorPoly = [1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1];

	let errorCorrectionBits = trimArrayStart(padArrayEnd(formatString, 15, 0));

	while (errorCorrectionBits.length > 10) {
		let paddedGeneratorPoly = padArrayEnd(generatorPoly, errorCorrectionBits.length, 0);
		errorCorrectionBits = trimArrayStart(errorCorrectionBits.map((x, i) => x ^ paddedGeneratorPoly[i]));
	}
	return padArrayStart(errorCorrectionBits, 10, 0);
}

export function getVersionInfoString(version) {
	const versionString = padArrayStart(toBinary(version), 6, 0);
	const errorBits = getVersionErrorBits(versionString);
	return [...versionString, ...errorBits];
}

export function getVersionErrorBits(versionString) {
	const generatorPoly = [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1];

	let errorCorrectionBits = trimArrayStart(padArrayEnd(versionString, 18, 0));

	while (errorCorrectionBits.length > 12) {
		let paddedGeneratorPoly = padArrayEnd(generatorPoly, errorCorrectionBits.length, 0);
		errorCorrectionBits = trimArrayStart(errorCorrectionBits.map((x, i) => x ^ paddedGeneratorPoly[i]));
	}
	return padArrayStart(errorCorrectionBits, 12, 0);
}

export function errorEncodePaddedPayload(paddedPayload, version, errorCorrectionLevel) {
	const groupedBlocks = groupBlocks(paddedPayload, version, errorCorrectionLevel);
	const ecGroupedBlocks = errorEncodeBlocks(groupedBlocks, version, errorCorrectionLevel);
	const interleavedBlocks = interleaveBlocks(groupedBlocks);
	const interleavedEcBlocks = interleaveBlocks(ecGroupedBlocks);
	const padBits = new Array(versionRemainderBits[version]).fill(0);
	return [...interleavedBlocks, ...interleavedEcBlocks, ...padBits].flat();
}

if(globalThis.customElements){
	customElements.define("wc-qr-code",
		class extends HTMLElement {
			#errorLevel;
			#payload;
			#mask;
			#scale;
			#dom;

			static get observedAttributes() {
				return ["payload", "errorlevel", "mask", "scale"]
			}
			constructor() {
				super();
				this.bind(this);
			}
			bind(element) {
				element.cacheDom.bind(element);
			}
			connectedCallback() {
				this.prerender();
				this.cacheDom();
				this.render();
			}
			prerender() {
				this.attachShadow({ mode: "open" });
				this.shadowRoot.innerHTML = `
					<style>canvas { width: 100%; height: 100%; image-rendering: pixelated; }</style>
					<canvas id="qr"></canvas>
				`;
			}
			cacheDom() {
				this.#dom = {
					qr: this.shadowRoot.querySelector("#qr")
				};
			}
			render() {
				if (!this.#errorLevel || !this.#payload || !this.#dom) return;
				const {
					encodedData,
					version
				} = qrEncodeData(this.#payload, this.#errorLevel);
				const matrix = QrCanvas.fromVersion(version);
				matrix.drawPayloadData(encodedData);
				const mask = this.#mask ?? matrix.getBestMask();
				matrix.applyMask(masks[mask]);
				matrix.drawFormatString(getFormatString(this.#errorLevel, mask));
				if (version >= 7) {
					matrix.drawVersionString(getVersionInfoString(version));
				}
				const scale = this.#scale ?? 1;

				this.#dom.qr.height = matrix.height * scale;
				this.#dom.qr.width = matrix.width * scale;
				const context = this.#dom.qr.getContext("2d");
				drawQrCanvas(context, matrix, { scale });
			}
			attributeChangedCallback(name, oldValue, newValue) {
				switch (name) {
					case "errorlevel": {
						this.errorLevel = newValue;
						break;
					}
					default: {
						this[name] = newValue;
					}
				}
			}
			set errorLevel(value) {
				this.#errorLevel = value;
				this.render();
			}
			set payload(value) {
				this.#payload = value;
				this.render();
			}
			set mask(value) {
				this.#mask = parseInt(value, 10);
				this.render();
			}
			set scale(value) {
				this.#scale = parseInt(value, 10);
				this.render();
			}
		}
	)
};