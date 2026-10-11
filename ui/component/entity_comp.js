// ui/core/component/entity_comp.js


/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { ESB } from "../../engine/core/signal/signal.js";
import { enum_create } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { signalbus_on, signalbus_emit } from "../../utils/signal_bus.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { UISB } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const __ACTIONS = enum_create(/**@type {const}*/([
    "CLOSE_PANEL",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function entitycomp_render() {
    return `
<h1>Entity</h1>
<button data-action="${__ACTIONS.CLOSE_PANEL}">Close</button>
<p>id: <span class="entity-id"></span></p>
<p>name: <span class="entity-name"></span></p>
<p>room_id: <span class="entity-room-id"></span></p>
    `;
}

/**
 * @param {HTMLElement} el
 * @param {EntityID} entity_id
 */
export function entitycomp_update(el, entity_id) {
    const s = store_get();
    const entity = undefined_unwrap(repository_get(s.world.entity_repo, entity_id));

    const span_id = el.querySelector(".entity-id");
    const span_name = el.querySelector(".entity-name");
    const span_room_id = el.querySelector(".entity-room-id");

    if (!span_id || !span_name || !span_room_id) throw new Error();

    span_id.textContent = entity.id.toString();
    span_name.textContent = entity.name;
    span_room_id.textContent = entity.room_id.toString();
}

/**
 * @param {HTMLElement} container 
 * @param {EntityID} entity_id
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function entitycomp_mount(container, entity_id) {
    return comp_create_comp(container, "entity-comp", (el, add_cleanup) => {
        el.innerHTML = entitycomp_render();

        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __entitycomp_handle_action(action, btn, entity_id);
        }));


        add_cleanup(signalbus_on(ESB, "entity.name.changed", (payload) => {
            if (payload.entity_id === entity_id) entitycomp_update(el, entity_id);
        }));
        add_cleanup(signalbus_on(ESB, "entity.room_id.changed", (payload) => {
            if (payload.entity_id === entity_id) entitycomp_update(el, entity_id);
        }));

        entitycomp_update(el, entity_id);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 * @param {EntityID} entity_id
 */
function __entitycomp_handle_action(action, btn, entity_id) {
    const s = store_get();
    switch (action) {
        case __ACTIONS.CLOSE_PANEL: {
            signalbus_emit(UISB, UI_SIGNAL.CLOSE_ENTITY_PANEL);
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
