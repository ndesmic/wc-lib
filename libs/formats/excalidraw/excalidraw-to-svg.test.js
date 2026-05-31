import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { excalidrawToSvg } from "./excalidraw-to-svg.js";
import { dedent, trimLines } from "../../string-utils.js";

describe("excalidraw-to-svg", () => {
	describe("rectangle", () => {
		it("should draw a rectangle", () => {
			const excalidraw = {
				"type": "excalidraw",
				"version": 2,
				"source": "https://excalidraw.com",
				"elements": [
					{
						"id": "ZSQLrSSkS2vs_vq5726xn",
						"type": "rectangle",
						"x": 490,
						"y": 293,
						"width": 49,
						"height": 19,
						"angle": 0,
						"strokeColor": "#1e1e1e",
						"backgroundColor": "transparent",
						"fillStyle": "solid",
						"strokeWidth": 2,
						"strokeStyle": "solid",
						"roughness": 0,
						"opacity": 100,
						"groupIds": [],
						"frameId": null,
						"index": "aC",
						"roundness": {
							"type": 2,
						},
						"boundElements": [],
						"link": null,
						"locked": false,
						"points": [
							[
								0,
								0,
							],
							[
								49,
								19,
							],
						],
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": null,
						"polygon": false,
					},
				],
			};
			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><rect height="19" width="49" x="490" y="293" stroke="#1e1e1e" stroke-width="2" fill="transparent" rx="4.75px" ry="4.75px"></rect></svg>`,
			);
		});
	});
	describe("line", () => {
		it("should draw a line", () => {
			const excalidraw = {
				elements: [{
					"id": "ZSQLrSSkS2vs_vq5726xn",
					"type": "line",
					"x": 490,
					"y": 293,
					"width": 49,
					"height": 19,
					"angle": 0,
					"strokeColor": "#1e1e1e",
					"backgroundColor": "transparent",
					"fillStyle": "solid",
					"strokeWidth": 2,
					"strokeStyle": "solid",
					"roughness": 0,
					"opacity": 100,
					"groupIds": [],
					"frameId": null,
					"index": "aC",
					"roundness": {
						"type": 2,
					},
					"seed": 1309629194,
					"version": 49,
					"versionNonce": 7657201,
					"boundElements": [],
					"updated": 1779376881038,
					"link": null,
					"locked": false,
					"points": [
						[
							0,
							0,
						],
						[
							49,
							19,
						],
					],
					"startBinding": null,
					"endBinding": null,
					"startArrowhead": null,
					"endArrowhead": null,
					"polygon": false,
				}],
			};

			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><line x1="490" y1="293" x2="539" y2="312" stroke="#1e1e1e" stroke-width="2"></line></svg>`,
			);
		});
	});
	describe("text", () => {
		it("should draw text", () => {
			const excalidraw = {
				elements: [{
					"id": "nVEZz3zRCsfYZ_QuKuxSe",
					"type": "text",
					"x": 1326,
					"y": 549,
					"width": 65.699951171875,
					"height": 25,
					"angle": 0,
					"strokeColor": "#1e1e1e",
					"backgroundColor": "#a5d8ff",
					"fillStyle": "solid",
					"strokeWidth": 2,
					"strokeStyle": "solid",
					"roughness": 1,
					"opacity": 100,
					"groupIds": [],
					"frameId": null,
					"index": "aE",
					"roundness": null,
					"seed": 321769919,
					"version": 60,
					"versionNonce": 1800774769,
					"isDeleted": false,
					"boundElements": [],
					"updated": 1779377043173,
					"link": null,
					"locked": false,
					"text": "Anchor",
					"fontSize": 20,
					"fontFamily": 5,
					"textAlign": "center",
					"verticalAlign": "middle",
					"containerId": "dGHclOn42nctBGssW2iv_",
					"originalText": "Anchor",
					"autoResize": true,
					"lineHeight": 1.25,
				}],
			};

			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><text x="1326" y="549" font-size="20" text-align="center" vertical-align="middle" stroke="#1e1e1e" stroke-width="0" dominant-baseline="hanging">Anchor</text></svg>`,
			);
		});
	});
	describe("ellipse", () => {
		it("should draw ellipse", () => {
			const excalidraw = {
				elements: [
					{
						"id": "u0xOBdNT65QEkaJWKzXF9",
						"type": "ellipse",
						"x": 1071,
						"y": 475,
						"width": 52,
						"height": 52,
						"angle": 0,
						"strokeColor": "#e03131",
						"backgroundColor": "#ffc9c9",
						"fillStyle": "hachure",
						"strokeWidth": 2,
						"strokeStyle": "solid",
						"roughness": 1,
						"opacity": 100,
						"groupIds": [],
						"frameId": null,
						"index": "b0m",
						"roundness": {
							"type": 2,
						},
						"seed": 1066012401,
						"version": 56,
						"versionNonce": 582948913,
						"isDeleted": false,
						"boundElements": [],
						"updated": 1779377601237,
						"link": null,
						"locked": false,
					},
				],
			};

			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><ellipse rx="26" ry="26" cx="1097" cy="501" stroke="#e03131" stroke-width="2" fill="url(#crosshatch-ffc9c9)"></ellipse>
				<defs><pattern patternUnits="userSpaceOnUse" width="10" height="10" id="crosshatch-ffc9c9"><line x1="0" x2="10" y1="10" y2="0" stroke-width="1" stroke="#ffc9c9"></line></pattern></defs></svg>`)));
		});
	});
	describe("arrow", () => {
		it("should draw arrow with 3 points", () => {
			const excalidraw = {
				elements: [
					{
						"id": "HXlCpt4Z-LQNticJaBfxp",
						"type": "arrow",
						"x": 1200,
						"y": 330,
						"width": 124,
						"height": 359,
						"angle": 0,
						"strokeColor": "#e03131",
						"backgroundColor": "#ffc9c9",
						"fillStyle": "solid",
						"strokeWidth": 2,
						"strokeStyle": "solid",
						"roughness": 1,
						"opacity": 100,
						"groupIds": [],
						"frameId": null,
						"index": "b0q",
						"roundness": {
							"type": 2,
						},
						"seed": 788813791,
						"version": 253,
						"versionNonce": 781534897,
						"isDeleted": false,
						"boundElements": [
							{
								"type": "text",
								"id": "rpfjqUWWZRKAqtpcdDLoB",
							},
						],
						"updated": 1779377637836,
						"link": null,
						"locked": false,
						"points": [
							[
								0,
								0,
							],
							[
								124.00378961436171,
								175,
							],
							[
								7.490161788786948,
								359,
							],
						],
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": "arrow",
						"elbowed": false,
					},
				],
			};

			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 1200 330 C 1241.3346 388.3333, 1322.7554 445.1667, 1324.0037896143617 505 C 1325.2521 564.8333, 1265.7470 627.6667, 1207.490161788787 689" stroke="#e03131" stroke-width="2" fill="transparent" marker-end="url(#arrow)"></path>
				<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" stroke="#e03131" stroke-width="1" fill="transparent"></path></marker></defs></svg>`)));
		});
		it("should draw arrow with 2 points", () => {
			const excalidraw = {
				elements: [
					{
						"id": "7tXxil-ON9xVjIKjXWE_G",
						"type": "arrow",
						"x": 1400,
						"y": 390,
						"width": 6,
						"height": 267,
						"angle": 0,
						"strokeColor": "#e03131",
						"backgroundColor": "#ffc9c9",
						"fillStyle": "solid",
						"strokeWidth": 2,
						"strokeStyle": "solid",
						"roughness": 1,
						"opacity": 100,
						"roundness": {
							"type": 2,
						},
						"points": [
							[
								0,
								0,
							],
							[
								-6,
								267,
							],
						],
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": "arrow",
						"elbowed": false,
					},
				],
			};

			const svg = excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 1400 390 L 1394 657" stroke="#e03131" stroke-width="2" fill="transparent" marker-end="url(#arrow)"></path>
				<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" stroke="#e03131" stroke-width="1" fill="transparent"></path></marker></defs></svg>`)));
		});
	});
	it("should not draw deleted element", () => {
		const excalidraw = {
			"type": "excalidraw",
			"version": 2,
			"source": "https://excalidraw.com",
			"elements": [
				{
					"id": "ZSQLrSSkS2vs_vq5726xn",
					"type": "rectangle",
					"x": 490,
					"y": 293,
					"width": 49,
					"height": 19,
					"angle": 0,
					"strokeColor": "#1e1e1e",
					"backgroundColor": "transparent",
					"fillStyle": "solid",
					"strokeWidth": 2,
					"strokeStyle": "solid",
					"roughness": 0,
					"opacity": 100,
					"groupIds": [],
					"frameId": null,
					"index": "aC",
					"isDeleted": true,
					"roundness": {
						"type": 2,
					},
					"boundElements": [],
					"link": null,
					"locked": false,
					"points": [
						[
							0,
							0,
						],
						[
							49,
							19,
						],
					],
					"startBinding": null,
					"endBinding": null,
					"startArrowhead": null,
					"endArrowhead": null,
					"polygon": false,
				},
			],
		};
		const svg = excalidrawToSvg(excalidraw);

		expect(svg).toEqual(
			`<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
		);
	});
	it("should include excalifont", () => {
		const excalidraw = {
			"type": "excalidraw",
			"version": 2,
			"source": "https://excalidraw.com",
			"elements": [],
		};
		const svg = excalidrawToSvg(excalidraw, {
			includeFont: true,
			fontUrl: "./excalifont.woff2",
		});

		expect(svg).toEqual(dedent(trimLines(`
			<svg xmlns="http://www.w3.org/2000/svg"><style>@font-face {
				font-family: "excalifont";
				src: url("./excalifont.woff2") format("woff2");
			}</style>
			<style>text {
				font-family: "excalifont", sans-serif;
			}</style></svg>`)));
	});
	it("should calculate offset when trimmed", () => {
		const excalidraw = {
			"type": "excalidraw",
			"version": 2,
			"source": "https://excalidraw.com",
			"elements": [
				{
					type: "rectangle",
					x: 0,
					y: 0,
					height: 100,
					width: 100,
				},
			],
		};
		const svg = excalidrawToSvg(excalidraw, {
			shouldTrim: true,
			padding: [5, 5, 5, 5],
		});

		expect(svg).toEqual(dedent(trimLines(`
			<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110"><rect height="100" width="100" x="5" y="5"></rect></svg>`)));
	});
});

//TODO tests: crosshatch, border-radius
