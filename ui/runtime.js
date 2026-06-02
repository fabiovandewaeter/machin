// @ts-check
// ui/runtime.js

import { new_world } from "../engine/core/world_service.js";
import { update } from "./update.js";
import { view } from "./view/view.js";

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
        case 'start_stop_tick_interval': {
            dispatch({ type: action });
            break;
        }
        case 'skip_seconds': {
            dispatch({ type: action, amount: parseInt(target.dataset.amount ?? '', 10) });
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
    tick_interval_id: null,
    world: new_world(),
};
let model = initial_model;

view(null, model);
