import { describe } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { TextCaseFormatter } from "../../simple-implementations/text-case-formatter.js";
import { multiTest } from "../test-tools.js";

describe("TextCaseFormatter", () => {
    describe("format", () => {
        multiTest([
            { args: [["foo", "bar", "baz"], { wordTransform: "upperFirst" } ], expected: "FooBarBaz" },
            { args: [["FOO", "BAR", "BAZ"], { wordTransform: "lowerFirst" } ], expected: "fOObARbAZ" },
            { args: [["foo", "bar", "baz"], { wordTransform: "upper" } ], expected: "FOOBARBAZ" },
            { args: [["FOO", "BAR", "BAZ"], { wordTransform: "lower" } ], expected: "foobarbaz" },
            { args: [["Foo", "Bar", "Baz"], { delimiter: "-" } ], expected: "Foo-Bar-Baz" },
            { args: [["FOO", "Bar", "Baz"], { delimiter: "-", wordTransform: "lowerFirst" } ], expected: "fOO-bar-baz" },
            { args: [["foo", "bar", "baz"], { delimiter: "-", startCase: "upper" } ], expected: "Foo-bar-baz" },
        ], (test) => {
            const textCaseFormatter = new TextCaseFormatter(test.args[0]);
            const result = textCaseFormatter.format(test.args[1]);
            expect(result).toEqual(test.expected);
        });
    });
    describe("parse", () => {
        multiTest([
            { args: ["foo-bar-baz", { delimiter: "-" } ], expected: ["foo", "bar", "baz"] },
            { args: ["FOO-BAR-BAZ", { delimiter: "-" } ], expected: ["FOO", "BAR", "BAZ"] },
            { args: ["fooBarBaz", { splitOnCase: "upper" } ], expected: ["foo", "Bar", "Baz"] },
            { args: ["fooBarBaz", { splitOnCase: "lower" } ], expected: ["f", "o", "oB", "a", "rB", "a", "z"] }
        ], (test) => {
            const textCaseFormatter = TextCaseFormatter.parse(test.args[0], test.args[1]);
            const result = textCaseFormatter.segments;
            expect(result).toEqual(test.expected);
        });
    });
    describe("convert", () => {
        multiTest([
            { args: ["foo-bar-baz", "kebabCase", "titleCase" ], expected: "FooBarBaz" },
            { args: ["foo_bar_baz", "snakeCase", "camelCase" ], expected: "fooBarBaz" },
            { args: ["fooBarBaz", "camelCase", "lowerSnakeCase" ], expected: "foo_bar_baz" },
            { args: ["fooBarBaz", "camelCase", "lowerKebabCase" ], expected: "foo-bar-baz" },
            { args: ["foo-Bar-Baz", "kebabCase", "upperSnakeCase" ], expected: "FOO_BAR_BAZ" },
        ], (test) => {
            const result = TextCaseFormatter.convert(test.args[0], test.args[1], test.args[2]);
            expect(result).toEqual(test.expected);
        });
    });
});
