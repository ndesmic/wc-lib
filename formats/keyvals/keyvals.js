/**
 * @typedef {{ valueDelimiter: string, lineDelimiter: string }} ParseKeyValsOptions
 * 
 * @param {string} xsv 
 * @param {ParseKeyValsOptions} options 
 * @returns {Record<string, string>}
 */
export function parseKeyVals(txt, { valueDelimiter = ":", lineDelimiter = "\n" } = {}) {
	const keyvals = txt.split(lineDelimiter)
		.filter(x => x.trim() !== "")
		.map(kv => kv.split(valueDelimiter))
		.filter(x => x.length > 1)
		.map(x => x.map(y => y.trim()));
	return Object.fromEntries(keyvals);
}
export const parseTextMap = txt => parseKeyVals(txt, { valueDelimiter: ":", lineDelimiter: ";" });