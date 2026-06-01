// @ts-check
// runtime.js

import { update } from "./update.js";
import { view } from "./view.js";


/**
 * @param {Msg} msg
 */
export function dispatch(msg) {
    console.log('Message reçu :', msg);
    const previous_model = model;
    model = update(model, msg);
    view(previous_model, model);
}

export function get_amount() {
    const input = /** @type {HTMLInputElement|null} */(document.querySelector('[data-field="amount"]'));
    return parseInt(input?.value ?? '', 10) || 1;
}

const body = document.getElementsByTagName('body')[0];
body.addEventListener('click', (event) => {
    const el = /** @type {HTMLElement | null} */ (event.target);
    const target = /** @type {HTMLElement | null} */ (el?.closest('[data-action]'));
    if (!target) return;

    const action = target.dataset.action;
    switch (action) {
        case 'increment':
        case 'decrement': {
            dispatch({ type: action, amount: get_amount() });
            break;
        }
        default:
            throw new Error();
    }
});

// rendu initial
/** @type {Model} */
let initial_model = {
    count: 1000,
    logs: ['un truc'],
};
let model = initial_model;

view(null, model);
