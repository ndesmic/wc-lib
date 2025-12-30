import { getSingleOrArray } from "./array-utils.js";

/**
 * Creates an element with props
 * @param {string} tag 
 * @param {{
 *  props: Record<string, any>,
 *  attrs: Record<string, any>,
 *  events: Record<string, function>,
 *  children: HTMLElement | HTMLElement[]
 * }} options
 * @returns 
 */
export function createElement(tag, options){
    const element = document.createElement(tag);
    for(const [key, val] of Object.entries(options.props ?? {})){
        element[key] = val;
    }
    for(const [key, val] of Object.entries(options.attrs ?? {})){
        if(typeof val === "string"){
            element.setAttribute(key, val);
        } else if (typeof val === "number"){
            element.setAttribute(key, val.toString());
        } else if(val === true){
            element.setAttribute(key,"");
        }
    }
    for(const [key, val] of Object.entries(options.events ?? {})){
        element.addEventListener(key, val);
    }
    for(const child of getSingleOrArray(options.children)){
        element.append(child);
    }
    return element;
}

/**
 * Creates a list with items
 * @param {number} items 
 * @param {{ contentFunction?: (number) => HTMLElement }} options 
 * @returns 
 */
export function createList(items, options){
  const ul = document.createElement("ul");
  for(let i = 0; i < items; i++){
    const li = document.createElement("li");
    if(options.contentFunction){
      li.append(options.contentFunction(i));
    }
    ul.append(li);
  }
  return ul;
}

/**
 * Creates a table with rows and cols
 * @param {number} rows 
 * @param {number} columns 
 * @param {{ contentFunction?: (number, number) => HTMLElement }} options 
 * @returns 
 */
export function createTable(rows, cols, options){
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  for (let row = 0; row < rows; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < cols; col++) {
      const td = document.createElement("td");
      if(options.contentFunction){
        td.append(options.contentFunction(row, col));
      }
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.appendChild(tbody);
  return table;
}