

export const END = Symbol("END");

export function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class Tokenizer {
	#tokenTypes;
	constructor(tokenTypes){
		this.#tokenTypes = tokenTypes.map(t => {
			if(typeof(t.matcher) === "string"){
				return { ...t, matcher: new RegExp(`^${escapeRegExp(t.matcher)}`) };
			}
			return t;
		});
	}

	*getTokens(text){
		let index = 0;
		while(index < text.length){
			const remaining = text.slice(index);
			let hasMatch = false;

			for(const { matcher, type } of this.#tokenTypes){
				const matched = matcher.exec(remaining);
				if(matched !== null){
					index += matched[0].length;
					if(type){
						yield {
							type: type,
							value: matched[0]
						}
						hasMatch = true;
						break;
					} else {
						continue;
					}
				}
			}
			if(!hasMatch){
				index++;
				//yield { type: "Unknown", value: remaining[0] };
				//throw new Error("Unexpected token");
			}
		}
		yield { type: END };
	}
}