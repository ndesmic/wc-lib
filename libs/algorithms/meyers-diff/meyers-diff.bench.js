import { getRandomString } from "../../random-utils.js";
import { meyersDiff } from "../meyers-diff/meyers-diff.js";
import { meyersDiff2 } from "../meyers-diff/meyers-diff2.js";

Deno.bench("meyers diff", { group: "meyers-diff", baseline: true }, b => {
	const x = getRandomString(5000);
	const y = getRandomString(5000);

	b.start();
	meyersDiff(x, y);
	b.end();
});

Deno.bench("meyers diff 2", { group: "meyers-diff", baseline: true }, b => {
	const x = getRandomString(5000);
	const y = getRandomString(5000);

	b.start();
	meyersDiff2(x, y);
	b.end();
});