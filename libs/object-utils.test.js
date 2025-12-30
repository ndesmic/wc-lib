import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { accessProperty } from "./object-utils.js";

describe("object-utils", () => {
	describe("accessProperty", () => {
		it("accesses property", () => {
			const result = accessProperty({ a: "a" }, "a");
			expect(result).toBe("a");
		});
		it("accesses deep property", () => {
			const result = accessProperty({ a: { b: "b" } }, "a.b");
			expect(result).toBe("b");
		});
        it("accesses property with number", () => {
			const result = accessProperty(["foo", "bar", "baz"], "1");
			expect(result).toBe("bar");
		});
        it("accesses deep property with number", () => {
			const result = accessProperty({ a: ["foo", "bar", "baz"] }, "a.1");
			expect(result).toBe("bar");
		});
        it("accesses property with function", () => {
			const result = accessProperty({ a: { b: "bar" } }, (obj) => obj.a.b);
			expect(result).toBe("bar");
		});
		it("returns null if no property", () => {
			const result = accessProperty({ a: { b: "b" } }, "c");
			expect(result).toBeNull();
		});
		it("returns null if no nested property", () => {
			const result = accessProperty({ a: { b: "b" } }, "a.c");
			expect(result).toBeNull();
		});
		it("returns null if no object", () => {
			const result = accessProperty(null, "a");
			expect(result).toBeNull();
		});
		it("returns null if no accessor", () => {
			const result = accessProperty({ a: "a" });
			expect(result).toBeNull();
		});
		it("returns null if accessing property of null", () => {
			const result = accessProperty({ a: { b: null } }, "a.b.c");
			expect(result).toBeNull();
		});
	});
});
