import { padArrayEnd } from "./array-utils.js";
import { joinPath } from "./path-utils.js";

//Scalar

export function parseBoolean(text) {
	if (typeof text === "boolean") {
		return text;
	}
	if (text === null || text === undefined) {
		return false;
	}
	return true;
}

export function parseIntOrDefault(text, defaultValue = 0) {
	if (typeof text !== "string") {
		return text;
	}
	if (!text.trim()) {
		return defaultValue;
	}
	return parseInt(text, 10);
}

//Arrays

export function parseArrayOrDefault(text, defaultValue = null) {
	if (typeof text === "string") {
		return text?.trim() ? text.split(",").map((x) => x.trim()) : defaultValue;
	}
	return text ?? defaultValue;
}

/**
 * @param {Array<number> | string} text
 * @param {Array<number>} defaultValue
 * @returns
 */
export function parseFloatArrayOrDefault(text, defaultValue = null) {
	if (typeof text === "string") {
		return text?.trim() ? text.split(",").map((x) => parseFloat(x.trim())) : defaultValue;
	}
	return text ?? defaultValue;
}

//Arrays of arrays

export function parseArrayOfArraysOrDefault(text, defaultValue = null) {
	if (typeof text === "string") {
		return text?.trim() ? text.split(";").map((v) => v.trim().split(",").map((x) => x.trim())) : defaultValue;
	}
	return text ?? defaultValue;
}

export function parseFloatArrayOfArraysOrDefault(text, defaultValue = null) {
	if (typeof text === "string") {
		return text?.trim() ? text.split(";").map((v) => v.trim().split(",").map((x) => parseFloat(x.trim()))) : defaultValue;
	}
	return text ?? defaultValue;
}

// Length Arrays

/**
 * @param {Array<number> | string} text
 * @param {number} length
 * @param {Array<number>} defaultValue
 * @returns
 */
export function parseFloatArrayWithLengthOrDefault(
	text,
	length,
	defaultValue = null,
) {
	let array;
	if (Array.isArray(text)) {
		array = text;
	} else {
		array = text?.trim() ? text.split(",").map((x) => parseFloat(x.trim())) : defaultValue;
	}

	if (array.length > length) {
		return array.slice(0, length);
	} else if (array.length < length) {
		return padArrayEnd(array, length);
	}
	return array;
}

//Date

export function parseDateOrDefault(textOrDate) {
	if (typeof textOrDate === "string") {
		const date = Date.parse(textOrDate);
		if (Number.isNaN(date.value)) {
			return new Date();
		}
		return date;
	}
	return textOrDate;
}

export function parseInstantOrDefault(textOrInstant) {
	if (typeof textOrInstant === "string") {
		try {
			const instant = Temporal.Instant.from(textOrInstant);
			return instant;
		} catch (e) {
			console.warn(
				`Instant failed to parse.  Got ${textOrDateTime} and failed with ${e}`,
			);
			return Temporal.Now.instant();
		}
	}
	return textOrInstant;
}

export function parsePlainDateTimeOrDefault(textOrDateTime) {
	if (typeof textOrDateTime === "string") {
		try {
			const instant = Temporal.PlainDateTime.from(textOrDateTime);
			return instant;
		} catch (e) {
			console.warn(
				`PlainDateTime failed to parse.  Got ${textOrDateTime} and failed with ${e}`,
			);
			return Temporal.Now.plainDateTimeISO();
		}
	}
	return textOrDateTime;
}

//Objects

/**
 * @param {string} text
 * @param {any} defaultValue
 * @param {boolean} isSilent
 * @returns
 */
export function parseJsonOrDefault(
	text,
	defaultValue = null,
	isSilent = false,
) {
	if (typeof text === "string") {
		try {
			const value = JSON.parse(text);
			return value;
		} catch (e) {
			if (!isSilent) {
				console.warn(`Could not parse value \`${text}\``);
			}
			return defaultValue;
		}
	}
	return text;
}

/**
 * @param {string} text
 * @param {any} defaultValue
 * @param {boolean} isSilent
 * @returns
 */
export function parseJsonOrThrow(text, isSilent = false) {
	try {
		if (typeof text === "string") {
			const value = JSON.parse(text);
			return value;
		}
	} catch (e) {
		if (!isSilent) {
			throw e;
		}
	}
	return text;
}

export function register(Component) {
	if (
		globalThis.customElements && !globalThis.customElements.get(Component.name)
	) {
		customElements.define(Component.name, Component);
	}
}

export async function renderOuterHTML(name, componentUrlStem, props = {}) {
	return `<${name} ${Object.entries(props).map(([k, v]) => `${k}="${v}"`).join(" ")}>
        ${await renderInnerHTML(componentUrlStem, props)}
    </${name}>`;
}

export async function renderInnerHTML(renderBase, componentName, props) {
	const renderPath = joinPath(renderBase, `${componentName}.render.js`);

	const module = await import(/* @vite-ignore */ renderPath);

	if (module?.render) {
		return module.render(props);
	}
	console.warn(
		`Could not find render module for ${componentName}`,
		Object.entries(renderModules),
	);
	return "";
}

export async function renderOuterHTMLNoProps(
	name,
	componentUrlStem,
	props = {},
) {
	return `<${name}>
        ${await renderInnerHTML(componentUrlStem, props)}
    </${name}>`;
}

export async function renderOuterHTMLNoPropsShadow(
	name,
	componentUrlStem,
	shadowMode = "open",
	props = {},
) {
	return `<${name}>
		<template shadowrootmode="${shadowMode}">
        ${await renderInnerHTML(componentUrlStem, props)}
    </template>
    </${name}>`;
}

export async function renderOuterHTMLNoPropsShadowWithStyles(
	renderBase,
	componentName,
	shadowMode = "open",
	props = {},
	styles = [],
) {
	return `<${componentName}>
		<template shadowrootmode="${shadowMode}">
				${styles.map((s) => `<link rel="stylesheet" href="${s}">`).join("\n")}
        ${await renderInnerHTML(renderBase, componentName, props)}
    </template>
    </${componentName}>`;
}
