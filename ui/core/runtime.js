// ui/core/runtime.js
// @ts-check

import { update } from "./update.js"
import { view } from "./view/view.js"
import * as Model from "./model.js"
import * as Direction from '../../engine/map/direction.js'

let model = init();

/**
 * @returns {Model}
 */
function init() {
    const app = document.getElementById('app');
    // attache les events listeners au app pour qu'ils ne soient jamais détruit par un innerHTML
    app?.addEventListener('click', (event) => {
        const el = /** @type {HTMLElement | null} */ (event.target);
        const target = /** @type {HTMLElement | null} */ (el?.closest('[data-msg-type]'));
        if (!target) return;

        const msg_type = target.dataset.msgType;
        switch (msg_type) {
            case 'start_stop_tick_interval':
            case 'start_main':
            case 'stop_main':
                dispatch({ type: msg_type }); break;
            case 'skip_seconds': dispatch({ type: msg_type, amount: parseInt(target.dataset.amount ?? '', 10) }); break;
            case 'direction': dispatch({ type: msg_type, direction: Direction.from_string(target.dataset.direction) }); break;
            case 'movement': {
                const [x, y, z] = (target.dataset.delta?.split(',').map(Number) ?? []);
                dispatch({ type: msg_type, delta: { x, y, z } });
                break;
            }

            default: throw new Error(`unknown msg_type: ${msg_type}`);
        }
    });

    let model = Model.create();
    view(null, model);

    return model;
}

/**
 * @param {Msg} msg
 */
export function dispatch(msg) {
    const prev = model;
    model = update(model, msg);
    view(prev, model);
}
