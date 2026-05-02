import { describe, } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { multiTest } from "./test-tools.js";
import { trimLines, decodeHtml, dedent } from "./string-utils.js";

describe("trimLines", () => {
   multiTest([
      { args: ["\n\nSome Text\n\n"], expected: "Some Text" },
      { args: ["\n\n\r\nSome Text\n\n\r\n"], expected: "Some Text" },
      { args: ["Some Text\n\n"], expected: "Some Text" },
      { args: ["\n\nSome Text"], expected: "Some Text" }
   ], ({ args, expected }) => {
      expect(trimLines(...args)).toEqual(expected);
   });
});

describe("dedent", () => {
   multiTest([
      { args: ["\t\t{\n\t\t\tconsole.log('hello');\n\t\t}"], expected: "{\n\tconsole.log('hello');\n}" },
      { args: ["  {\n    console.log('hello');\n  }"], expected: "{\n  console.log('hello');\n}" },
      { args: ["{\n\t\tconsole.log('hello');\n}"], expected: "{\n\t\tconsole.log('hello');\n}" },
   ], ({ args, expected }) => {
      expect(dedent(...args)).toEqual(expected);
   });
});

describe("decodeHtml", () => {
   multiTest([
      { args: ["hello&gt;"], expected: "hello>" },
      { args: ["&lt;world"], expected: "<world" },
      { args: ["&nbsp;"], expected: "\u00a0" },
      { args: ["&amp;"], expected: "&" }
   ], ({ args, expected }) => {
      expect(decodeHtml(...args)).toEqual(expected);
   });
});