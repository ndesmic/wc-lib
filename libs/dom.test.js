import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Dom } from "../libs/dom.js";

describe("dom", () => {
	describe("element", () => {
		it("should create an element", () => {
			const el = Dom.createElement("svg");
			expect(el.toString()).toEqual("<svg></svg>");
		});
		it("should add attributes to an element", () => {
			const el = Dom.createElement("svg");
			el.setAttribute("height", 99);
			el.setAttribute("width", 77);
			expect(el.toString()).toEqual(`<svg height="99" width="77"></svg>`);
		});
		it("should create an element and add a child", () => {
			const el = Dom.createElement("svg");
			const childEl = Dom.createElement("rect");
			childEl.setAttribute("x", 1);
			childEl.setAttribute("y", 2);
			childEl.setAttribute("width", 10);
			childEl.setAttribute("height", 20);
			el.appendChild(childEl);
			expect(el.toString()).toEqual(
				`<svg><rect x="1" y="2" width="10" height="20"></rect></svg>`,
			);
		});
		it("should create an element and add multiple children", () => {
			const el = Dom.createElement("svg");
			const childEl = Dom.createElement("rect");
			childEl.setAttribute("x", 1);
			childEl.setAttribute("y", 2);
			childEl.setAttribute("width", 10);
			childEl.setAttribute("height", 20);
			const childEl2 = Dom.createElement("rect");
			childEl2.setAttribute("x", 3);
			childEl2.setAttribute("y", 4);
			childEl2.setAttribute("width", 30);
			childEl2.setAttribute("height", 40);
			el.appendChild(childEl);
			el.appendChild(childEl2);
			const result = el.toString();
			expect(result).toEqual(
				`<svg><rect x="1" y="2" width="10" height="20"></rect>\n<rect x="3" y="4" width="30" height="40"></rect></svg>`,
			);
		});
	});
});
