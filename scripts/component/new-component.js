import { parseArgs } from "@std/cli/parse-args";
import { StringTemplater } from "../../libs/string-templater.js";
import { TextCaseFormatter } from "../../libs/text-case-formatter.js";
import componentHtml from "./component.html" with { type: "text" };
import componentJs from "./component.js" with { type: "text" };
import componentMd from "./component.md" with { type: "text" };

const args = parseArgs(Deno.args);
const name = args._[0];

if(!name){
    throw new Error(`No component name supplied (use kebab-case like the filename)`);
}

const textCaseFormatter = TextCaseFormatter.parse(name, { delimiter: "-" }); //my-component

const componentKebabCase = textCaseFormatter.format({ delimiter: "-", wordTransform: "lower" });  //"wc-my-component";
const prefixedComponentKebabCase = `wc-` + componentKebabCase;  //"wc-my-component";
const componentTitleCase = `Wc` + textCaseFormatter.format({ wordTransform: "upperFirst" });  //"WcMyComponent";
const componentTitleSpaced = textCaseFormatter.format({ delimiter: " ", wordTransform: "upperFirst" }) //"My Component"

const templater = new StringTemplater({
    tagStart: "{{",
    tagEnd: "}}"
});

const templatedComponentHtml = templater.template(componentHtml, {
    prefixedComponentKebabCase,
    componentKebabCase,
    componentTitleCase,
    componentTitleSpaced
});

const templatedComponentJs = templater.template(componentJs, {
    prefixedComponentKebabCase,
    componentKebabCase,
    componentTitleCase,
    componentTitleSpaced
});

const templatedComponentMd = templater.template(componentMd, {
    prefixedComponentKebabCase,
    componentKebabCase,
    componentTitleCase,
    componentTitleSpaced
});

Deno.mkdirSync(`./components/${componentKebabCase}/`, { recursive: true });
Deno.writeTextFileSync(`./components/${componentKebabCase}/${prefixedComponentKebabCase}-example.html`, templatedComponentHtml);
Deno.writeTextFileSync(`./components/${componentKebabCase}/${prefixedComponentKebabCase}.js`, templatedComponentJs);
Deno.writeTextFileSync(`./components/${componentKebabCase}/${prefixedComponentKebabCase}.md`, templatedComponentMd);