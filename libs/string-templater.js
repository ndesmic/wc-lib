export class StringTemplater {

  #tagStart = "${";
  #tagEnd = "}";
  #fallbackFunction = (key) => `[not found: ${key}]`
  
  /**
   * @typedef {{
   *  template: string,
   *  tagStart?: string,
   *  tagEnd?: string,
   *  fallbackFunction?: (string) => string
   * }} StringTemplaterOptions
   * @param {StringTemplaterOptions} options 
   * @returns 
   */
  constructor(options = {}){
    this.#tagStart = options.tagStart ?? this.#tagStart;
    this.#tagEnd = options.tagEnd ?? this.#tagEnd;
    this.#fallbackFunction = options.fallbackFunction ?? this.#fallbackFunction;
    this.bind();
  }
  
  bind(){
    this.template = this.template.bind(this);
  }
  
  template(template, values){
    const regex = new RegExp(`${RegExp.escape(this.#tagStart)}(.*?)${RegExp.escape(this.#tagEnd)}`, "g");
    const result = template.replaceAll(regex, matchString => {
      const key = matchString.slice(this.#tagStart.length, -this.#tagEnd.length);
      if(Object.hasOwn(values, key)){
        return values[key];
      } else {
        return this.#fallbackFunction(key);
      }
    });
    return result;
  }
}