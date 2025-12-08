export function jsTokensToDom(tokens){
	const docFrag = document.createDocumentFragment();
	for(const token of tokens){
		switch(token.type){
			case "generic-whitespace": {
				const text = document.createTextNode("\u00A0");
				docFrag.appendChild(text);
				break;
			}
			case "tab": {
				const text = document.createTextNode("\u00A0\u00A0\u00A0\u00A0");
				docFrag.appendChild(text);
				break;
			}
			case "newline": {
				const br = document.createElement("br");
				docFrag.appendChild(br);
				break;
			}
			case "string-literal":
			case "double-quote": 
			case "single-quote":
			case "backtick": {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("string-literal");
				docFrag.appendChild(span);
				break;
			}
			case "number-literal" : {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("number-literal");
				docFrag.appendChild(span);
				break;
			}
			case "identifier" : {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("identifier");
				docFrag.appendChild(span);
				break;
			}
			case "comma":
			case "plus":
			case "minus":
			case "multiply":
			case "divide":
			case "increment":
			case "decrement":
			case "exponent":
			case "equal-assign":
			case "equal-compare":
			case "equal-compare-strict":
			case "less-than":
			case "less-than-equal":
			case "greater-than":
			case "greater-than-equal":
			case "semicolon":
			case "dot": {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("operator");
				docFrag.appendChild(span);
				break;
			}
			case "keyword:const":
			case "keyword:function":
			case "keyword:class": 
			case "keyword:delete":
			case "keyword:debugger":
			case "keyword:export":
			case "keyword:extends":
			case "keyword:in":
			case "keyword:instanceof":
			case "keyword:let":
			case "keyword:new":
			case "keyword:super":
			case "keyword:this":
			case "keyword:typeof":
			case "keyword:var":
			case "keyword:void": {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("keyword-1");
				docFrag.appendChild(span);
				break;
			}
			case "keyword:for":
			case "keyword:break":
			case "keyword:case":
			case "keyword:catch":
			case "keyword:continue":
			case "keyword:default":
			case "keyword:do":
			case "keyword:else":
			case "keyword:finally":
			case "keyword:import":
			case "keyword:from":
			case "keyword:if":
			case "keyword:return":
			case "keyword:switch":
			case "keyword:throw":
			case "keyword:try":
			case "keyword:while":
			case "keyword:with":
			case "keyword:yield": {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("keyword-2");
				docFrag.appendChild(span);
				break;
			}
			case "open-paren":
			case "close-paren":
			case "open-curly":
			case "close-curly":
			case "open-square":
			case "close-square": {
				const span = document.createElement("span");
				span.textContent = token.value;
				span.classList.add("grouping");
				docFrag.appendChild(span);
				break;
			}
			default:
		}
	}
	return docFrag;
}