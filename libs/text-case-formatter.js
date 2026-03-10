/**
 * @typedef {{
 *  delimiter: string,
 *  splitOnCase: "lower" | "upper" | "none"
 * }} TextCaseFormatterParseOptions 
 */

/**
 * @typedef {{
 *  delimiter: string,
 *  wordTransform: "upper" | "lower" | "upperFirst" | "lowerFirst",
 *  startCase: "upper" | "lower"
 * }} TextCaseFormatterFormatOptions 
 * 
 */
export class TextCaseFormatter {
    #segments;

    static knownInputCase = {
        kebabCase: { delimiter: "-" },
        snakeCase: { delimiter: "_" },
        camelCase: { splitOnCase: "upper" }
    }

    static knownOutputCase = {
        lowerKebabCase: { delimiter: "-", wordTransform: "lower" },
        lowerSnakeCase: { delimiter: "_", wordTransform: "lower" },
        upperSnakeCase: { delimiter: "_", wordTransform: "upper" },
        titleCase: { wordTransform: "upperFirst" },
        camelCase: { wordTransform: "upperFirst", startCase: "lower" },
    }

    static convert(text, from, to){
        const fmt = TextCaseFormatter.parse(text, from);
        return fmt.format(to);
    }

    static parse(text, options){
        if(typeof(options) === "string"){
            options = TextCaseFormatter.knownInputCase[options];
            if(!options){
                throw new Error(`Case ${options} is not a well-known input case.`);
            }
        }

        let segments;

        if(options.delimiter){
            segments = text.split(options.delimiter);
        } else {
            segments = [text];
        }

        switch(options.splitOnCase){
            case "lower": {
                segments = segments.map(seg => seg.split(/(?=[a-z])/g));
                break;
            }
            case "upper": {
                segments = segments.map(seg => seg.split(/(?=[A-Z])/g));
                break;
            }
        }
        return new TextCaseFormatter(segments.flat(Infinity));
    }

    constructor(segments){
        this.#segments = segments;
    }

    get segments(){
        return this.#segments;
    }

    format(options){
        if(typeof(options) === "string"){
            options = TextCaseFormatter.knownOutputCase[options];
            if(!options){
                throw new Error(`Case ${options} is not a well-known output case.`);
            }
        }

        let segments = this.#segments;
        
        switch(options.wordTransform){
            case "upper": {
                segments = segments.map(seg => seg.toUpperCase());
                break;
            }
            case "lower": {
                segments = segments.map(seg => seg.toLowerCase());
                break;
            }
            case "lowerFirst": {
                segments = segments.map(seg => seg.charAt(0).toLowerCase() + seg.slice(1));
                break;
            }
            case "upperFirst": {
                segments = segments.map(seg => seg.charAt(0).toUpperCase() + seg.slice(1));
                break;
            }
        }

        switch(options.startCase){
            case "upper": {
                segments[0] = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
                break;
            }
            case "lower": {
                segments[0] = segments[0].charAt(0).toLowerCase() + segments[0].slice(1);
            }
        }
        
        return segments.join(options.delimiter ?? "");
    }
}