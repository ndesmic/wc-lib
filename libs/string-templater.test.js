import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { StringTemplater } from "./string-templater.js";

describe("StringTemplater", () => {
    describe("template", () => {
        it("should template template string", () => {
            const templater = new StringTemplater();
            const result = templater.template("hello ${foo}", { foo: "bar!" });
            expect(result).toBe("hello bar!");
        });
        it("should template template string (multi value)", () => {
            const templater = new StringTemplater();
            const result = templater.template("hello ${foo} ${bar}", { foo: "foo!", bar: "bar!" });
            expect(result).toBe("hello foo! bar!");
        });
        it("should use fallback if not found", () => {
            const templater = new StringTemplater();
            const result = templater.template("hello ${foo} ${bar}", { foo: "foo!" });
            expect(result).toBe("hello foo! [not found: bar]");
        });
    });
});