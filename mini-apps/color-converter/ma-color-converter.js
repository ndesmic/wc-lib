function parseColor(text){
    if(text.startsWith("#")){ //hex
        const hexCodes = text.slice(1);
        const r = parseInt(hexCodes.substring(0,2), 16);
        const g = parseInt(hexCodes.substring(2,4), 16);
        const b = parseInt(hexCodes.substring(4,6), 16);
        return { success: true, value: { r, g, b }};
    }
    if(text.startsWith("rgb(")){
        const match = text.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
        if(match){
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return { success: true, value: { r, g, b }};
        }
        return { success: false, reason: `Invalid color format, tried to parse as rgb()` };
    }
    return { success: false, reason: `Can't parse color ${text}. Not a known format.` };
}

export class MaColorConverter extends HTMLElement {
    connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.onColorInput();
    }
    bind(){
        this.onColorInput = this.onColorInput.bind(this);
    }
    registerDom(){
        this.dom = {
            inputColor: this.querySelector(".input-color"),
            outputRgbHex: this.querySelector(".output-rgb-hex"),
            outputRgbInt: this.querySelector(".output-rgb-int"),
            outputRgbFloat: this.querySelector(".output-rgb-float"),
            swatch: this.querySelector("mc-swatch")
        };
    }
    attachEvents(){
       this.dom.inputColor.addEventListener("input", this.onColorInput);
    }
    onColorInput(){
        const color = parseColor(this.dom.inputColor.value);
        if(color.success){
            const rgb = `rgb(${color.value.r}, ${color.value.g}, ${color.value.b})`;
            this.dom.swatch.setAttribute("value", rgb);
            this.dom.outputRgbHex.value = `#${color.value.r.toString(16)}${color.value.g.toString(16)}${color.value.b.toString(16)}`;
            this.dom.outputRgbInt.value = rgb;
            this.dom.outputRgbFloat.value = `${(color.value.r / 255).toFixed(2)}, ${(color.value.g / 255).toFixed(2)}, ${(color.value.b / 255).toFixed(2)}`;
        }
    }
}

customElements.define("ma-color-converter", MaColorConverter);