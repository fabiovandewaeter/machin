// @ts-check
// ui/view/render_controls.js

import '../types.js';

// // TODO: supprimer ça même si le innerHTML pose plus problème maintenant qu'on met listeners sur parent
// function render_controls(prev, next) {
//     const controls = document.getElementById('controls');
//     controls.innerHTML = `
//         <label>Montant: <input id="amount" type=number" value="${get_amount()}" data-field="amount" /></label>
//         <button data-action="decrement">-1</button>
//         <button data-action="increment">+1</button>
//     `;
// }

/**
 * @param {Model|null} prev
 * @param {Model} next
 */
export function render_controls(prev, next) {
    const controls = document.getElementById('controls');
    if (!controls) throw new Error();
    if (prev?.tick_interval_id === next.tick_interval_id) return;

    const button = document.getElementById('start_stop_tick_interval');
    if (!button) throw new Error();
    if (next.tick_interval_id === null) {
        button.textContent = "Start";
    }
    else {
        button.textContent = "Stop";
    }
}
