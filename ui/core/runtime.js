// ui/core/runtime.js
// @ts-check

import { update } from "./update.js"
import { view } from "./view/view.js"
import * as Model from "./model.js"
import * as Direction from '../../engine/map/direction.js'
import * as Opt from '../../utils/option.js'
import * as Save from '../../utils/save.js'

let model = init();

/**
 * @returns {D<Model>}
 */
function init() {
    const app = /**@type {HTMLElement}*/(document.getElementById('app'));
    app.tabIndex = -1
    app.focus();

    // attache les events listeners au app pour qu'ils ne soient jamais détruit par un innerHTML
    add_event_listener_click(app);
    add_event_listener_keydown(app);

    let model = Model.create();
    // déjà initialisé si load depuis save, sinon on initialise ici
    if (!model.is_initialized) model = Model.init(model);
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
    Save.save(model);
}

/**
 * @param {HTMLElement} app 
 */
function add_event_listener_click(app) {
    app.addEventListener('click', (event) => {
        const el = /** @type {HTMLElement | null} */ (event.target);
        const target = /** @type {HTMLElement | null} */ (el?.closest('[data-msg-type]'));
        if (!target) return;

        const msg_type = target.dataset.msgType;
        switch (msg_type) {
            case 'start_stop_tick_interval':
            case 'start_main':
            case 'stop_main':
            case 'download_save':
            case 'upload_save':
            case 'clear_save':
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
}

/**
 * @param {HTMLElement} app 
 */
function add_event_listener_keydown(app) {
    app.addEventListener('keydown', (event) => {
        const delta = key_to_delta(event.key);

        if (Opt.is_some(delta)) {
            event.preventDefault(); // empêche scroll avec flèches
            dispatch({ type: 'movement', delta: delta.value });
        }
    });
}

/**
 * @param {string} key 
 * @returns {Opt<Coord3D>}
 */
function key_to_delta(key) {
    switch (key) {
        case 'z': case 'ArrowUp': return Opt.some({ x: 0, y: 1, z: 0 });
        case 's': case 'ArrowDown': return Opt.some({ x: 0, y: -1, z: 0 });
        case 'd': case 'ArrowRight': return Opt.some({ x: 1, y: 0, z: 0 });
        case 'q': case 'ArrowLeft': return Opt.some({ x: -1, y: 0, z: 0 });
        case 'e': return Opt.some({ x: 0, y: 0, z: 1 });
        case 'a': return Opt.some({ x: 0, y: 0, z: -1 });
    }
    return Opt.none;
}
