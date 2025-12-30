// @ts-check
/** @typedef {import("../../types/tensor.d.ts").Tensor} Tensor */
import { createElement, createList } from "../../libs/dom-utils.js";
import { parseBoolean, parseIntOrDefault, parseArrayOfArraysOrDefault } from "../../libs/wc-utils.js";
import systemCss from "../../css/system.css" with { type: "css" };
import multiGridInputCss from "./wc-multi-grid-input.css" with { type: "css" };

export class WcMultiGridInput extends HTMLElement {
    static observedAttributes = ["instances", "values", "add-instance", "columns", "rows"];

    #instances = 1;
    #grids;
    /** @type {Tensor[]} */
    #values = [];
    #rows = 3;
    #columns = 3;
    #addInstance;

    connectedCallback(){
        this.bind();
        this.renderDom();
        this.registerDom();
        this.attachEvents();
    }
    bind(){
        this.onInput = this.onInput.bind(this);
        this.updateDom = this.updateDom.bind(this);
        this.onAddInstance = this.onAddInstance.bind(this);
    }
    renderDom(){
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.adoptedStyleSheets = [systemCss, multiGridInputCss];
        this.#grids = new Array(this.#instances);
        this.shadow.append(createList(this.#instances, {
            contentFunction: (i) => {
                const element = createElement("wc-grid-input", {
                    props: {
                        rows: this.#values[i].shape?.[1] ?? this.#rows,
                        columns: this.#values[i].shape?.[0] ?? this.#columns,
                        values: this.#values[i].values
                    }
                });
                this.#grids[i] = element;
                return element;
            }
        }));
        if(this.#addInstance){
            this.shadow.append(createElement("button", {
                props: {
                    id: "add-instance"
                },
                children: "Add instance",
                events: {
                    click: this.onAddInstance
                }
            }))
        }
    }
    updateDom(){
        if(!this.shadow) return;
        this.shadow.querySelector("ul").remove();
        this.shadow.querySelector("button").remove();
        this.#grids = new Array(this.#instances);
        this.shadow.append(createList(this.#instances, {
            contentFunction: (i) => {
                const element = createElement("wc-grid-input", {
                    props: {
                        rows: this.#values[i].shape?.[1],
                        columns: this.#values[i].shape?.[0],
                        values: this.#values[i].values
                    }
                });
                this.#grids[i] = element;
                return element;
            }
        }));
        if(this.#addInstance){
            this.shadow.append(createElement("button", {
                props: {
                    id: "add-instance"
                },
                children: "Add instance",
                events: {
                    click: this.onAddInstance
                }
            }))
        }
    }
    registerDom(){
        this.dom = {
        };
    }
    attachEvents(){
        this.addEventListener("grid-input", this.onInput);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue;
        }
    }
    onInput(){
        const event = new CustomEvent("multi-grid-input", {
            bubbles: true,
            composed: true,
            detail: { 
                values: this.#grids.map(g => g.values)
            }
        });
        this.dispatchEvent(event);
    }
    onAddInstance(){
        this.instances = this.instances + 1;
    }
    get rows(){
        return this.#rows;
    }
    set rows(value){
        this.#rows = parseIntOrDefault(value, 3);
        this.updateDom();
    }

    get columns(){
        return this.#columns;
    }
    set columns(value){
        this.#columns = parseIntOrDefault(value, 3);
        this.updateDom();
    }

    get instances(){
        return this.#instances;
    }
    set instances(value){
        this.#instances = parseIntOrDefault(value, 1);
        this.updateDom();
    } 

    set ["add-instance"](value){
        this.#addInstance = parseBoolean(value);
        this.updateDom();
    }
   
    set values(value){
        const parsedValues = parseArrayOfArraysOrDefault(value);
        //if it's just an array we take the values but if it's an object we expect a kernel object
        this.#values = Array.isArray(parsedValues[0])
            ? parsedValues.map(v => ({ values: v, shape: [this.#columns, this.#rows] }))
            : parsedValues;

        this.updateDom();
    }
    get values(){
        return this.#grids.values.map(el => el.value);
    }
}

customElements.define("wc-multi-grid-input", WcMultiGridInput);