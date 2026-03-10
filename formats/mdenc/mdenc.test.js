import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { decryptBytes } from "./mdenc.js";

describe("mdenc", () => {
    describe("decryptBytes", () => {
        it("should decypt mdenc bytes", async () => {
            const payload = {   
                "version": "2.0",
                "hint": "3r",
                "encodedData": "ZcuzOV89b1H0bwWnmgr3asAiQJjqp+1Hb1tr46JzH/g8+uAxXWcfhxE/7ooHRr1q3gKC"
            };
            const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
            const result = await decryptBytes(encodedPayload, "test3r");
            const textResult = new TextDecoder().decode(result.payload);
            expect(textResult).toEqual("foo");
        });
    });
});