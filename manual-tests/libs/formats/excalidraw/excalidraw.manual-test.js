import { encodeBase64 } from "@std/encoding/base64";
import { excalidrawToSvg } from "../../../../libs/formats/excalidraw/excalidraw-to-svg.js";
import testData from "./test7.excalidraw.json" with { type: "json" };

const font = Deno.readFileSync("./fonts/excalifont-regular.woff2");
const b64 = encodeBase64(font);
const fontUrl = `data:font/woff2;base64,${b64}`;

const svg = excalidrawToSvg(testData, {
	includeFont: true,
	fontUrl,
	shouldTrim: true,
	padding: [100, 100, 100, 100],
});

Deno.writeTextFileSync("test.svg", svg);
