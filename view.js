// @ts-nocheck
// view.js

import { get_amount } from "./runtime.js";

/**
 * @param {Model|null} prev
 * @param {Model} next 
 */
export function view(prev, next) {
    render_controls(prev, next);
    render_counter(prev, next);
    render_logs(prev, next);
}

/**
 * @param {Model|null} prev
 * @param {Model} next
 */
function render_counter(prev, next) {
    const counter = document.getElementById('counter')
    if (!counter) { throw new Error(); return }
    if (prev?.count === next.count) return;

    counter.textContent = next.count.toString();
}
/**
 * @param {Model|null} prev
 * @param {Model} next 
 */
function render_logs(prev, next) {
    const log_list = document.getElementById('log-list')
    if (!log_list) { throw new Error(); return }
    if (prev?.logs === next.logs) return;

    const logs_to_add = next.logs.slice(prev?.logs.length);
    logs_to_add.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        log_list.appendChild(li);
    })
}
// TODO: supprimer ça même si le innerHTML pose plus problème maintenant qu'on met listeners sur parent
function render_controls(prev, next) {
    const controls = document.getElementById('controls');
    controls.innerHTML = `
        <label>Montant: <input id="amount" type=number" value="${get_amount()}" data-field="amount" /></label>
        <button data-action="decrement">-1</button>
        <button data-action="increment">+1</button>
    `;
}
