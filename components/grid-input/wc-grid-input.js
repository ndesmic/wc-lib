import { createTable, createElement } from "../../libs/dom-utils.js";
import { parseBoolean, parseArrayOrDefault } from "../../libs/wc-utils.js";
import systemCss from "../../css/system.css" with { type: "css" };
import gridInputCss from "./wc-grid-input.css" with { type: "css" };

export class WcGridInput extends HTMLElement {
    static observedAttributes = ["rows", "columns", "add-rows", "add-columns", "values"];

    #rows = 3;
    #columns = 3;
    #grid;
     /** @type {Tensor[]} */
    #values;
    #addRows;
    #addColumns;

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onInput = this.onInput.bind(this);
        this.updateDom = this.updateDom.bind(this);
        this.onAddRow = this.onAddRow.bind(this);
        this.onAddColumn = this.onAddColumn.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.adoptedStyleSheets = [systemCss, gridInputCss];
        this.#grid = { values: [], shape: [this.#rows, this.#columns] };
        const table = createTable(this.#rows, this.#columns, { 
            contentFunction: (row, col) => {
                const input = createElement("input", { 
                    props: {
                        value: this.#values.values[row * this.#values.shape[0] + col] ?? ""
                    },
                    attrs: {
                        id: `${row}-${col}`, 
                        row, 
                        col 
                    }
                });
                this.#grid.values[row * this.#columns + col] = input;
                return input;
            }
        });
        if(this.#addRows){
            table.querySelector("tbody").append(createElement("tr", { 
                children: createElement("td", {
                    attrs: {
                         colspan: this.#columns
                    },
                    children: createElement("button", {
                        events: {
                            click: this.onAddRow
                        },
                        attrs: {
                            id: "add-row"
                        },
                        children: "add row"
                    })
                })
            }));
        }
        if(this.#addColumns){
            table.querySelector("tbody tr").append(createElement("td", {
                attrs: {
                    rowspan: this.#rows
                },
                children: createElement("button", {
                    events: {
                        click: this.onAddColumn
                    },
                    attrs: {
                        id: "add-column"
                    },
                    children: "add column"
                })
            }));
        }
        this.shadow.append(table);
    }
    updateDom(){
        if(!this.shadow) return;
        this.shadow.querySelector("table").remove();
        this.#grid = { values: [], shape: [this.#rows, this.#columns] };
        const table = createTable(this.#rows, this.#columns, { 
            contentFunction: (row, col) => {
                const input = createElement("input", { 
                    props: {
                        value: this.#values.values[row * this.#values.shape[0] + col] ?? ""
                    },
                    attrs: {
                        id: `${row}-${col}`, 
                        row, 
                        col 
                    }
                });
                this.#grid.values[row * this.#columns + col] = input;
                return input;
            }
        });
        if(this.#addRows){
            table.querySelector("tbody").append(createElement("tr", { 
                children: createElement("td", {
                    attrs: {
                         colspan: this.#columns
                    },
                    children: createElement("button", {
                        events: {
                            click: this.onAddRow
                        },
                        attrs: {
                            id: "add-row"
                        },
                        children: "add row"
                    })
                })
            }));
        }
        if(this.#addColumns){
            table.querySelector("tbody tr").append(createElement("td", {
                attrs: {
                    rowspan: this.#rows
                },
                children: createElement("button", {
                    events: {
                        click: this.onAddColumn
                    },
                    attrs: {
                        id: "add-column"
                    },
                    children: "add column"
                })
            }));
        }
        
        this.shadow.append(table);
    }
    registerDom(){
        this.dom = {
        };
    }
    attachEvents(){
        this.addEventListener("input", this.onInput);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    onInput(e){
        e.stopPropagation();
        e.stopImmediatePropagation();
        const event = new CustomEvent("grid-input", {
            bubbles: true,
            composed: true,
            detail: { 
                value: {
                    values: this.#grid.values.map(el => el.value),
                    shape: this.#grid.shape
                }
            }
        });
        this.dispatchEvent(event);
    }
    onAddRow(){
        this.rows = this.rows + 1;
    }
    onAddColumn(){
        this.columns = this.columns + 1;
    }
    get rows(){
        return this.#rows;
    }
    set rows(value){
        this.#rows = value;
        this.updateDom();
    }

    get columns(){
        return this.#columns;
    }
    set columns(value){
        this.#columns = value;
        this.updateDom();
    }

    set ["add-rows"](value){
        this.#addRows = parseBoolean(value);
        this.updateDom();
    }
    set ["add-columns"](value){
        this.#addColumns = parseBoolean(value);
        this.updateDom();
    }
    set values(values){
        const parsedValues = parseArrayOrDefault(values, new Array(this.#rows * this.#columns).fill(""));
        //if it's just an array we take the values but if it's an object we expect a kernel object
        this.#values = Array.isArray(parsedValues)
            ? { values: parsedValues, shape: [ this.#columns, this.#rows ]}
            : parsedValues
        this.updateDom();
    }
    get values(){
        return {
            values: this.#grid.values.map(el => el.value),
            shape: this.#grid.shape
        }
    }
}

customElements.define("wc-grid-input", WcGridInput);