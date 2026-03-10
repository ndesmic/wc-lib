import { parseArgs } from "@std/cli/parse-args";
import { StringTemplater } from "../../libs/string-templater.js";
import { TextCaseFormatter } from "../../libs/text-case-formatter.js";
import appHtml from "./app.html" with { type: "text" };
import appJs from "./app.js" with { type: "text" };

const args = parseArgs(Deno.args);
const name = args._[0];

if(!name){
    throw new Error(`No app name supplied (use kebab-case like the filename)`);
}

const textCaseFormatter = TextCaseFormatter.parse(name, { delimiter: "-" }); //my-component
const appKebabCase = textCaseFormatter.format({ delimiter: "-", wordTransform: "lower" });  //"wc-my-component";
const prefixedAppKebabCase = `ma-` + appKebabCase;  //"wc-my-component";
const appTitleCase = `Ma` + textCaseFormatter.format({ wordTransform: "upperFirst" });  //"WcMyComponent";
const appTitleSpaced = textCaseFormatter.format({ delimiter: " ", wordTransform: "upperFirst" }) //"My Component"

const templater = new StringTemplater({
    tagStart: "{{",
    tagEnd: "}}"
});

const templatedAppHtml = templater.template(appHtml, {
    prefixedAppKebabCase,
    appKebabCase,
    appTitleCase,
    appTitleSpaced
});

const templatedAppJs = templater.template(appJs, {
    prefixedAppKebabCase,
    appKebabCase,
    appTitleCase,
    appTitleSpaced
});

Deno.mkdirSync(`./mini-apps/${appKebabCase}/`, { recursive: true });
Deno.writeTextFileSync(`./mini-apps/${appKebabCase}/${appKebabCase}.html`, templatedAppHtml, { });
Deno.writeTextFileSync(`./mini-apps/${appKebabCase}/${prefixedAppKebabCase}.js`, templatedAppJs);

//TODO: hook it up to index.html