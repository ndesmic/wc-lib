import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { parseTxsvRecords, parseTxsvTuples, parseTxsvTensor } from "./txsv.js";

describe("txsv", () => {
	describe("parseTxsvTuples", () => {
		it("should parse csv", () => {
			const result = parseTxsvTuples(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
			`,
				{
					valueDelimiter: ",",
				},
			);

			expect(result).toEqual([
				["1", "2", "3"],
				["4", "5", "6"],
				["7", "8", "9"],
			]);
		});
		it("should parse tsv", () => {
			const result = parseTxsvTuples(`
				1	2	3
				4	5	6
				7	8	9
			`);

			expect(result).toEqual([
				["1", "2", "3"],
				["4", "5", "6"],
				["7", "8", "9"],
			]);
		});
		it("should parse csv with custom line delimiter", () => {
			const result = parseTxsvTuples(`1, 2, 3; 4, 5, 6; 7, 8, 9;`, {
				valueDelimiter: ",",
				lineDelimiter: ";",
			});

			expect(result).toEqual([
				["1", "2", "3"],
				["4", "5", "6"],
				["7", "8", "9"],
			]);
		});
		it("should parse tsv with int types", () => {
			const result = parseTxsvTuples(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
			`,
				{
					valueDelimiter: ",",
					columns: ["int", "int", "int"],
				},
			);

			expect(result).toEqual([
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
			]);
		});
		it("should parse tsv with float types", () => {
			const result = parseTxsvTuples(
				`
				1.1, 2.2, 3.3
				4.4, 5.5, 6.6
				7.7, 8.8, 9.9
			`,
				{
					valueDelimiter: ",",
					columns: ["float", "float", "float"],
				},
			);

			expect(result).toEqual([
				[1.1, 2.2, 3.3],
				[4.4, 5.5, 6.6],
				[7.7, 8.8, 9.9],
			]);
		});
		it("should parse tsv with date types", () => {
			const result = parseTxsvTuples(
				`
				2026-06-06, 2026-06-07, 2026-06-08
				2026-06-09, 2026-06-10, 2026-06-11
				2026-06-12, 2026-06-13, 2026-06-14
			`,
				{
					valueDelimiter: ",",
					columns: ["date", "date", "date"],
				},
			);

			expect(result).toEqual([
				[
					new Date("2026-06-06"),
					new Date("2026-06-07"),
					new Date("2026-06-08"),
				],
				[
					new Date("2026-06-09"),
					new Date("2026-06-10"),
					new Date("2026-06-11"),
				],
				[
					new Date("2026-06-12"),
					new Date("2026-06-13"),
					new Date("2026-06-14"),
				],
			]);
		});
		it("should parse tsv with mixed types", () => {
			const result = parseTxsvTuples(
				`
				foo, 2, 3.3
				bar, 5, 6.6
				baz, 8, 9.9
			`,
				{
					valueDelimiter: ",",
					columns: ["string", "int", "float"],
				},
			);

			expect(result).toEqual([
				["foo", 2, 3.3],
				["bar", 5, 6.6],
				["baz", 8, 9.9],
			]);
		});
		it("should parse tsv with mixed types (infered)", () => {
			const result = parseTxsvTuples(
				`
				foo: string, bar: int, baz: float
				foo, 2, 3.3
				bar, 5, 6.6
				baz, 8, 9.9
			`,
				{
					valueDelimiter: ",",
					columns: "infer",
				},
			);

			expect(result).toEqual([
				["foo", 2, 3.3],
				["bar", 5, 6.6],
				["baz", 8, 9.9],
			]);
		});
	});
	describe("parseTxsvRecords", () => {
		it("should parse csv", () => {
			const result = parseTxsvRecords(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
			`,
				{
					valueDelimiter: ",",
					columns: ["foo", "bar", "baz"],
				},
			);

			expect(result).toEqual([
				{ foo: "1", bar: "2", baz: "3" },
				{ foo: "4", bar: "5", baz: "6" },
				{ foo: "7", bar: "8", baz: "9" },
			]);
		});
		it("should parse tsv", () => {
			const result = parseTxsvRecords(
				`
				1	2	3
				4	5	6
				7	8	9
			`,
				{
					columns: ["foo", "bar", "baz"],
				},
			);

			expect(result).toEqual([
				{ foo: "1", bar: "2", baz: "3" },
				{ foo: "4", bar: "5", baz: "6" },
				{ foo: "7", bar: "8", baz: "9" },
			]);
		});
		it("should parse csv with custom line delimiter", () => {
			const result = parseTxsvRecords(`1, 2, 3; 4, 5, 6; 7, 8, 9;`, {
				valueDelimiter: ",",
				lineDelimiter: ";",
				columns: ["foo", "bar", "baz"],
			});

			expect(result).toEqual([
				{ foo: "1", bar: "2", baz: "3" },
				{ foo: "4", bar: "5", baz: "6" },
				{ foo: "7", bar: "8", baz: "9" },
			]);
		});
		it("should parse tsv with int types", () => {
			const result = parseTxsvRecords(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
			`,
				{
					valueDelimiter: ",",
					columns: [
						["foo", "int"],
						["bar", "int"],
						["baz", "int"],
					],
				},
			);

			expect(result).toEqual([
				{ foo: 1, bar: 2, baz: 3 },
				{ foo: 4, bar: 5, baz: 6 },
				{ foo: 7, bar: 8, baz: 9 },
			]);
		});
		it("should parse tsv with float types", () => {
			const result = parseTxsvRecords(
				`
				1.1, 2.2, 3.3
				4.4, 5.5, 6.6
				7.7, 8.8, 9.9
			`,
				{
					valueDelimiter: ",",
					columns: [
						["foo", "float"],
						["bar", "float"],
						["baz", "float"],
					],
				},
			);

			expect(result).toEqual([
				{ foo: 1.1, bar: 2.2, baz: 3.3 },
				{ foo: 4.4, bar: 5.5, baz: 6.6 },
				{ foo: 7.7, bar: 8.8, baz: 9.9 }
			]);
		});
		it("should parse tsv with date types", () => {
			const result = parseTxsvRecords(
				`
				2026-06-06, 2026-06-07, 2026-06-08
				2026-06-09, 2026-06-10, 2026-06-11
				2026-06-12, 2026-06-13, 2026-06-14
			`,
				{
					valueDelimiter: ",",
					columns: [["foo", "date"], ["bar", "date"], ["baz","date"]],
				},
			);

			expect(result).toEqual([
				{
					foo: new Date("2026-06-06"),
					bar: new Date("2026-06-07"),
					baz: new Date("2026-06-08"),
				},
				{
					foo: new Date("2026-06-09"),
					bar: new Date("2026-06-10"),
					baz: new Date("2026-06-11"),
				},
				{
					foo: new Date("2026-06-12"),
					bar: new Date("2026-06-13"),
					baz: new Date("2026-06-14"),
				},
			]);
		});
		it("should use first row as columns if unspecified (no types)", () => {
			const result = parseTxsvRecords(
				`
				foo, bar, baz
				1, 2, 3
				4, 5, 6
				7, 8, 9
			`,
				{
					valueDelimiter: ",",
					columns: "infer",
				},
			);

			expect(result).toEqual([
				{ foo: "1", bar: "2", baz: "3" },
				{ foo: "4", bar: "5", baz: "6" },
				{ foo: "7", bar: "8", baz: "9" },
			]);
		});
		it("should use first row as columns if unspecified (with types)", () => {
			const result = parseTxsvRecords(
				`
				foo: string, bar: int, baz: float, qux: date
				hello, 2, 3.3, 2026-06-06
				world, 5, 6.6, 2026-06-07
				good bye, 8, 9.9, 2026-06-08
				world, 10, 11.1, 2026-06-09
			`,
				{
					valueDelimiter: ",",
					columns: "infer",
				},
			);

			expect(result).toEqual([
				{ foo: "hello", bar: 2, baz: 3.3, qux: new Date("2026-06-06") },
				{ foo: "world", bar: 5, baz: 6.6, qux: new Date("2026-06-07") },
				{ foo: "good bye", bar: 8, baz: 9.9, qux: new Date("2026-06-08") },
				{ foo: "world", bar: 10, baz: 11.1, qux: new Date("2026-06-09") },
			]);
		});
	});
	describe("parseTxsvTensor", () => {
		it("should parse csv as f32", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Float32Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse tsv as f32", () => {
			const result = parseTxsvTensor(
				`
				1	2	3
				4	5	6
				7	8	9
				10	11	12
			`);

			expect(result).toEqual({
				shape: [4,3],
				values: new Float32Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as f32 and skip first row", () => {
			const result = parseTxsvTensor(
				`
				foo, bar, baz
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					skipFirstRow: true
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Float32Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as f16", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "f16"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Float16Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as i32", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "i32"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Int32Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as i16", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "i16"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Int16Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as i8", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "i8"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Int8Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as u32", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "u32"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Uint32Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as u16", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "u16"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Uint16Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
		it("should parse csv as u8", () => {
			const result = parseTxsvTensor(
				`
				1, 2, 3
				4, 5, 6
				7, 8, 9
				10, 11, 12
			`,
				{
					valueDelimiter: ",",
					type: "u8"
				},
			);

			expect(result).toEqual({
				shape: [4,3],
				values: new Uint8Array([
					1, 2, 3,
					4, 5, 6,
					7, 8, 9,
					10, 11, 12
				])
			});
		});
	});
});
