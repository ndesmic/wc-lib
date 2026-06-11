import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getOrigin, joinPath, resolveRelativePath } from "./path-utils.js";
import { multiTest } from "./test-tools.js";

describe("path-utils", () => {
	describe("joinPath", () => {
		multiTest([
			{
				args: ["foo", "bar"],
				expected: "foo/bar",
				name: "should join two values",
			},
			{
				args: ["foo/bar", "baz/qux"],
				expected: "foo/bar/baz/qux",
				name: "should join two paths",
			},
			{
				args: ["foo/", "bar"],
				expected: "foo/bar",
				name: "should join two values, extra end slash",
			},
			{
				args: ["foo", "/bar"],
				expected: "foo/bar",
				name: "should join two values, extra start slash",
			},
			{
				args: ["/foo/bar/", "/baz/qux"],
				expected: "/foo/bar/baz/qux",
				name: "should join two values, keep first slash",
			},
			{
				args: ["foo/bar/", "/baz/qux/"],
				expected: "foo/bar/baz/qux/",
				name: "should join two values, keep last slash",
			},
		], (test) => {
			expect(joinPath(...test.args)).toEqual(test.expected);
		});
	});
	describe("getOrigin", () => {
		multiTest([
			{ name: "normal dotcom", args: ["http://foo.com/a/b/c"], expected: "http://foo.com" },
			//{ name: "localhost with port", args: ["http://localhost:8000/a/b/c"], expected : "foo:bar" },
			//{ name: "localhost", args: ["http://localhost/a/b/c"], expected : "foo:bar" },
			//{ name: "simple origin", args: ["foo:bar/a/b/c"], expected : "foo:bar" },
		], (test) => {
			expect(getOrigin(...test.args)).toEqual(test.expected);
		});
	});
	describe("resolveRelativePath", () => {
		multiTest([
			// { name: "append path", args: ["a", "foo:bar/"], expected : "foo:bar/a" },
			// { name: "append multipath", args: ["a/b", "foo:bar/"], expected : "foo:bar/a/b" },
			// { name: "append multipath more", args: ["a/b/c", "foo:bar/"], expected : "foo:bar/a/b/c" },
			// { name: "back path", args: ["..", "foo:bar/a"], expected : "foo:bar/" },
			// { name: "back path with append", args: ["../a", "foo:bar/b/c"], expected : "foo:bar/b/a" },
			// { name: "back path with multipath append", args: ["../a/d", "foo:bar/b/c"], expected : "foo:bar/b/a/d" },
			// { name: "back path mutliple", args: ["../../d", "foo:bar/a/b/c"], expected : "foo:bar/a/d" },
			// { name: "absolute path", args: ["/d", "foo:bar/a/b/c"], expected : "/d" },
			{ name: "path with leading dot to file", args: ["./d", "foo:bar/a/b/c"], expected: "foo:bar/a/b/d" },
			{ name: "path with leading dot to folder", args: ["./d", "foo:bar/a/b/c/"], expected: "foo:bar/a/b/c/d" },
		], (test) => {
			expect(resolveRelativePath(...test.args)).toEqual(test.expected);
		});
	});
});
