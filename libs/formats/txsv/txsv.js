/**
 * @typedef {"string" | "int" | "float" |"date" } XsvType
 * @typedef {[string, XsvType]} XsvNameType
 * @typedef {string | XsvNameType} ColumnDefinition
 *
 * string[] is the set of colums, infer gets types data, none parses all columns as strings
 * @typedef {XsvType[] | "infer" | "none"} TupleColumnDefinitions
 * Cannot be none because we at least need names
 * @typedef {ColumnDefinition[] | "infer" } RecordColumnDefinitions
 *
 * @typedef {{
 * 	valueDelimiter: string,
 * 	lineDelimiter: string,
 *  columns?: TupleColumnDefinitions,
 * }} ParseXsvTuplesOptions
 *
 * @param {string} xsv
 * @param {ParseXsvTuplesOptions} options
 * @returns {string[][]}
 */
export function parseTxsvTuples(xsv, options) {
	const valueDelimiter = options?.valueDelimiter ?? "\t";
	const lineDelimiter = options?.lineDelimiter ?? "\n";
	let columns = options?.columns ?? "none";

	let rows = xsv
		.split(lineDelimiter)
		.filter((x) => x.trim() !== "")
		.map((line) =>
			line
				.split(valueDelimiter)
				.filter((v) => v.trim())
				.map((v) => v.trim())
		);
	if (columns === "infer") {
		columns = rows[0].map((r) => {
			if (r.indexOf(":") === -1) {
				return "string";
			}
			return r.split(":")[1].trim();
		});
		rows = rows.slice(1);
	}
	if (Array.isArray(columns)) {
		return rows.map((row) => {
			return row.map((cell, i) => {
				switch (columns[i]) {
					case "string": {
						return cell;
					}
					case "int": {
						return parseInt(cell, 10);
					}
					case "float": {
						return parseFloat(cell);
					}
					case "date": {
						return new Date(cell);
					}
					default: {
						throw new Error(
							`Unknown columns type for column index ${i}, ${columns[i]}`,
						);
					}
				}
			});
		});
	}
	return rows;
}

/**
 * @typedef {{
 * 	valueDelimiter: string,
 * 	lineDelimiter: string,
 *  columns?: RecordColumnDefinitions
 * }} ParseXsvRecordsOptions
 *
 * Parses xsv file using delimiters, if columns are not passed assumes the first row will contain columns
 * @param {string} xsv
 * @param {ParseXsvRecordsOptions} options
 * @returns {Object[]}
 */
export function parseTxsvRecords(xsv, options) {
	const valueDelimiter = options?.valueDelimiter ?? "\t";
	const lineDelimiter = options?.lineDelimiter ?? "\n";
	let rows = parseTxsvTuples(xsv, { valueDelimiter, lineDelimiter });
	let columns = options?.columns ?? "infer";

	if (columns === "infer") {
		columns = rows[0].map((r) => {
			if (r.indexOf(":") === -1) {
				return [r.trim(), "string"];
			}
			return r.split(":").map((v) => v.trim());
		});
		rows = rows.slice(1);
	}

	return rows.map((tuple) => {
		const record = {};
		for (let i = 0; i < columns.length; i++) {
			if (Array.isArray(columns[i])) {
				switch (columns[i][1]) {
					case "string": {
						record[columns[i][0]] = tuple[i];
						break;
					}
					case "int": {
						record[columns[i][0]] = parseInt(tuple[i], 10);
						break;
					}
					case "float": {
						record[columns[i][0]] = parseFloat(tuple[i]);
						break;
					}
					case "date": {
						record[columns[i][0]] = new Date(tuple[i]);
						break;
					}
					default: {
						throw new Error(
							`Unknown columns type for column index ${i}, ${columns[i]}`,
						);
					}
				}
			} else {
				record[columns[i]] = tuple[i];
			}
		}
		return record;
	});
}

/**
 * @typedef {{
 * 	valueDelimiter: string,
 * 	lineDelimiter: string,
 *  type: "i32" | "i16" | "i8" | "u32" | "u16" | "u8" | "u64" | "f32" | "f16" | "f64",
 *  skipFirstRow: boolean
 * }} ParseXsvTensorOptions
 *
 * @param {string} xsv
 * @param {ParseXsvTensorOptions} options
 */
export function parseTxsvTensor(xsv, options) {
	const valueDelimiter = options?.valueDelimiter ?? "\t";
	const lineDelimiter = options?.lineDelimiter ?? "\n";
	const type = options?.type ?? "f32";
	const isFloat = type.startsWith("f");

	let rows = xsv
		.split(lineDelimiter)
		.filter((x) => x.trim() !== "")
		.map((line) =>
			line
				.split(valueDelimiter)
				.filter((v) => v.trim())
				.map((v) => (isFloat ? parseFloat(v) : parseInt(v, 10)))
		);

	if (options?.skipFirstRow) {
		rows = rows.slice(1);
	}
	const width = rows[0].length;
	const height = rows.length;
	const area = width * height;

	let buffer;
	switch (type) {
		case "i32": {
			buffer = new Int32Array(area);
			break;
		}
		case "i16": {
			buffer = new Int16Array(area);
			break;
		}
		case "i8": {
			buffer = new Int8Array(area);
			break;
		}
		case "u32": {
			buffer = new Uint32Array(area);
			break;
		}
		case "u16": {
			buffer = new Uint16Array(area);
			break;
		}
		case "u8": {
			buffer = new Uint8Array(area);
			break;
		}
		case "f64": {
			buffer = new Float64Array(area);
			break;
		}
		case "f16": {
			buffer = new Float16Array(area);
			break;
		}
		case "f32":
		default: {
			buffer = new Float32Array(area);
		}
	}

	for (let r = 0; r < rows.length; r++) {
		for (let c = 0; c < rows[r].length; c++) {
			buffer[r * width + c] = rows[r][c];
		}
	}

	return {
		shape: [height, width],
		values: buffer,
	};
}
