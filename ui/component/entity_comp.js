// ui/core/component/entity_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 */
import { ESB } from "../../engine/core/signals.js";
import { enum_create } from "../../utils/enum.js";
import { option_unwrap } from "../../utils/option.js";
import { repository_get } from "../../utils/repository.js";
import { signalbus_on, signalbus_emit } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { UI_SIGNAL, UISB } from "../core/signals.js";
import { store_get } from "../core/store.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const ACTIONS = enum_create(/**@type {const}*/([
    "CLOSE_PANEL",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function entitycomp_render() {
    return `
<h1>Entity</h1>
<button data-action="${ACTIONS.CLOSE_PANEL}">Close</button>
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

        add_cleanup(comp_delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            entitycomp_handle_action(action, btn, entity_id);
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
function entitycomp_handle_action(action, btn, entity_id) {
    const s = store_get();
    switch (action) {
        case ACTIONS.CLOSE_PANEL: {
            signalbus_emit(UISB, UI_SIGNAL.CLOSE_ENTITY_PANEL);
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
