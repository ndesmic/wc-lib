import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { excalidrawToSvg } from "./excalidraw-to-svg.js";
import { dedent, trimLines } from "../../string-utils.js";

describe("excalidraw-to-svg", () => {
	describe("rectangle", () => {
		it("should draw a rectangle", async () => {
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
							"type": 1,
						},
						"boundElements": [],
						"link": null,
						"locked": false,
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": null,
						"polygon": false,
					},
				],
			};
			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><rect height="19" width="49" x="490" y="293" stroke="#1e1e1e" stroke-width="2" fill="transparent"></rect></svg>`,
			);
		});
		it("should draw a rectangle with cross hatch", async () => {
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
						"backgroundColor": "#ff0000",
						"fillStyle": "hachure",
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
			const svg = await excalidrawToSvg(excalidraw, { shouldPrefixIds: true });

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><rect height="19" width="49" x="490" y="293" stroke="#1e1e1e" stroke-width="2" fill="url(#4d1d27c3aa57bbfef41ba89130dfcacbb0a6cc0b0f177d70478423512159c809-crosshatch-ff0000)" rx="4.75px" ry="4.75px"></rect>
				<defs><pattern patternUnits="userSpaceOnUse" width="10" height="10" id="4d1d27c3aa57bbfef41ba89130dfcacbb0a6cc0b0f177d70478423512159c809-crosshatch-ff0000"><line x1="0" x2="10" y1="10" y2="0" stroke-width="1" stroke="#ff0000"></line></pattern></defs></svg>`)));
		});
		it("should draw a rectangle with border radius", async () => {
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
							"type": 3,
						},
						"boundElements": [],
						"link": null,
						"locked": false,
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": null,
						"polygon": false,
					},
				],
			};
			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><rect height="19" width="49" x="490" y="293" stroke="#1e1e1e" stroke-width="2" fill="transparent" rx="4.75px" ry="4.75px"></rect></svg>`,
			);
		});
	});
	// describe("line", () => {
	// 	it("should draw a line", async () => {
	// 		const excalidraw = {
	// 			elements: [{
	// 				"id": "ZSQLrSSkS2vs_vq5726xn",
	// 				"type": "line",
	// 				"x": 490,
	// 				"y": 293,
	// 				"width": 49,
	// 				"height": 19,
	// 				"angle": 0,
	// 				"strokeColor": "#1e1e1e",
	// 				"backgroundColor": "transparent",
	// 				"fillStyle": "solid",
	// 				"strokeWidth": 2,
	// 				"strokeStyle": "solid",
	// 				"roughness": 0,
	// 				"opacity": 100,
	// 				"groupIds": [],
	// 				"frameId": null,
	// 				"index": "aC",
	// 				"roundness": {
	// 					"type": 2,
	// 				},
	// 				"seed": 1309629194,
	// 				"version": 49,
	// 				"versionNonce": 7657201,
	// 				"boundElements": [],
	// 				"updated": 1779376881038,
	// 				"link": null,
	// 				"locked": false,
	// 				"points": [
	// 					[
	// 						0,
	// 						0,
	// 					],
	// 					[
	// 						49,
	// 						19,
	// 					],
	// 				],
	// 				"startBinding": null,
	// 				"endBinding": null,
	// 				"startArrowhead": null,
	// 				"endArrowhead": null,
	// 				"polygon": false,
	// 			}],
	// 		};

	// 		const svg = await excalidrawToSvg(excalidraw);

	// 		expect(svg).toEqual(
	// 			`<svg xmlns="http://www.w3.org/2000/svg"><line x1="490" y1="293" x2="539" y2="312" stroke="#1e1e1e" stroke-width="2"></line></svg>`,
	// 		);
	// 	});
	// });
	describe("text", () => {
		it("should draw text", async () => {
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
					"originalText": "Anchor",
					"autoResize": true,
					"lineHeight": 1.25,
				}],
			};

			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(
				`<svg xmlns="http://www.w3.org/2000/svg"><text id="nVEZz3zRCsfYZ_QuKuxSe" x="1326" y="549" dominant-baseline="hanging" font-size="20" vertical-align="middle" fill="#1e1e1e" stroke-width="0">Anchor</text></svg>`,
			);
		});
		it("should draw text bound to line", async () => {
			const excalidraw = {
				elements: [
					{
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
						"boundElements": [
							{
								"id": "nVEZz3zRCsfYZ_QuKuxSe",
								"type": "text",
							},
						],
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": null,
						"polygon": false,
					},
					{
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
						"originalText": "Anchor",
						"autoResize": true,
						"lineHeight": 1.25,
						"containerId": "ZSQLrSSkS2vs_vq5726xn",
					},
				],
			};

			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><line x1="490" y1="293" x2="539" y2="312" stroke="#1e1e1e" stroke-width="2"></line>
				<text id="nVEZz3zRCsfYZ_QuKuxSe" x="514.5" y="302.5" text-anchor="middle" dominant-baseline="central" font-size="20" vertical-align="middle" fill="#1e1e1e" stroke-width="0">Anchor</text></svg>`)));
		});
		it("should draw text bound to arrow", async () => {
			const excalidraw = {
				elements: [
					{
						"id": "ZSQLrSSkS2vs_vq5726xn",
						"type": "arrow",
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
						"boundElements": [
							{
								"id": "nVEZz3zRCsfYZ_QuKuxSe",
								"type": "text",
							},
						],
						"startBinding": null,
						"endBinding": null,
						"startArrowhead": null,
						"endArrowhead": null,
						"polygon": false,
					},
					{
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
						"originalText": "Anchor",
						"autoResize": true,
						"lineHeight": 1.25,
						"containerId": "ZSQLrSSkS2vs_vq5726xn",
					},
				],
			};

			const svg = await excalidrawToSvg(excalidraw, { shouldPrefixIds: true });

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 490 293 L 539 312" stroke="#1e1e1e" stroke-width="2" fill="transparent" mask="url(#16def57d0ef7ac3b6d4a2f5ce110e484a41984e2ccfd81274cedfc60cc4d6769-mask-nVEZz3zRCsfYZ_QuKuxSe)" marker-end="url(#16def57d0ef7ac3b6d4a2f5ce110e484a41984e2ccfd81274cedfc60cc4d6769-arrow)"></path>
				<text id="16def57d0ef7ac3b6d4a2f5ce110e484a41984e2ccfd81274cedfc60cc4d6769-nVEZz3zRCsfYZ_QuKuxSe" x="514.5" y="302.5" text-anchor="middle" dominant-baseline="central" font-size="20" vertical-align="middle" fill="#1e1e1e" stroke-width="0">Anchor</text>
				<defs><mask id="16def57d0ef7ac3b6d4a2f5ce110e484a41984e2ccfd81274cedfc60cc4d6769-mask-nVEZz3zRCsfYZ_QuKuxSe" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="100%" height="100%" fill="#FFF"></rect>
				<rect x="473.6500244140625" y="282" width="81.699951171875" height="41" fill="#000"></rect></mask></defs></svg>`)));
		});
	});
	describe("ellipse", () => {
		it("should draw ellipse", async () => {
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
						"fillStyle": "solid",
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

			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><ellipse rx="26" ry="26" cx="1097" cy="501" stroke="#e03131" stroke-width="2" fill="#ffc9c9"></ellipse></svg>`)));
		});
		it("should draw ellipse with cross-hatch", async () => {
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

			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><ellipse rx="26" ry="26" cx="1097" cy="501" stroke="#e03131" stroke-width="2" fill="url(#crosshatch-ffc9c9)"></ellipse>
				<defs><pattern patternUnits="userSpaceOnUse" width="10" height="10" id="crosshatch-ffc9c9"><line x1="0" x2="10" y1="10" y2="0" stroke-width="1" stroke="#ffc9c9"></line></pattern></defs></svg>`)));
		});
	});
	describe("arrow", () => {
		it("should draw arrow with 3 points", async () => {
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

			const svg = await excalidrawToSvg(excalidraw);

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 1200 330 C 1241.3346 388.3333, 1322.7554 445.1667, 1324.0037896143617 505 C 1325.2521 564.8333, 1265.7470 627.6667, 1207.490161788787 689" stroke="#e03131" stroke-width="2" fill="transparent" marker-end="url(#arrow)"></path>
				<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" stroke="#e03131" stroke-width="1" fill="transparent"></path></marker></defs></svg>`)));
		});
		it("should draw arrow with 2 points", async () => {
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

			const svg = await excalidrawToSvg(excalidraw, { shouldPrefixIds: false });

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 1400 390 L 1394 657" stroke="#e03131" stroke-width="2" fill="transparent" marker-end="url(#arrow)"></path>
				<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" stroke="#e03131" stroke-width="1" fill="transparent"></path></marker></defs></svg>`)));
		});
		it("should draw arrow with 2 points and id prefixing", async () => {
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

			const svg = await excalidrawToSvg(excalidraw, { shouldPrefixIds: true });

			expect(svg).toEqual(dedent(trimLines(`
				<svg xmlns="http://www.w3.org/2000/svg"><path d="M 1400 390 L 1394 657" stroke="#e03131" stroke-width="2" fill="transparent" marker-end="url(#e643943d14b7f4c51673e7ad2f86cef5145a7b8742dc2ea5be263bd83417a27f-arrow)"></path>
				<defs><marker id="e643943d14b7f4c51673e7ad2f86cef5145a7b8742dc2ea5be263bd83417a27f-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" stroke="#e03131" stroke-width="1" fill="transparent"></path></marker></defs></svg>`)));
		});
	});
	it("should not draw deleted element", async () => {
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
		const svg = await excalidrawToSvg(excalidraw);

		expect(svg).toEqual(
			`<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
		);
	});
	it("should include excalifont", async () => {
		const excalidraw = {
			"type": "excalidraw",
			"version": 2,
			"source": "https://excalidraw.com",
			"elements": [],
		};
		const svg = await excalidrawToSvg(excalidraw, {
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
	it("should calculate offset when trimmed", async () => {
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
		const svg = await excalidrawToSvg(excalidraw, {
			shouldTrim: true,
			padding: [5, 5, 5, 5],
		});

		expect(svg).toEqual(dedent(trimLines(`
			<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110"><rect height="100" width="100" x="5" y="5"></rect></svg>`)));
	});
});
