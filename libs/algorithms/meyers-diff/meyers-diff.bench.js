import { getRandomString } from "../../random-utils.js";
import { meyersDiffNaive, meyersDiffMiddleSnake } from "../meyers-diff/meyers-diff.js";

Deno.bench("Meyers diff naive", { group: "meyers-diff", baseline: true }, b => {
	const x = getRandomString(2000);
	const y = getRandomString(2000);

	b.start();
	meyersDiffNaive(x, y);
	b.end();
});

Deno.bench("Meyers diff middle-snake", { group: "meyers-diff" }, b => {
	const x = getRandomString(2000);
	const y = getRandomString(2000);

	b.start();
	meyersDiffMiddleSnake(x, y);
	b.end();
});