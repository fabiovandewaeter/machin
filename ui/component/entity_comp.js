// ui/core/component/entity_comp.js

/**
 * @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { enum_create } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_emit } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { comp_create_comp_with_sub_comps, comp_delegate_click_with_enum } from "./core/comp.js";
import { subcompmanager_add } from "./core/sub_comp_manager.js";
import { inventorycomp_mount } from "./inventory_comp.js";

const __INVENTORY_KEY = "INVENTORY_KEY";

const __ACTIONS = enum_create(/**@type {const}*/([
    "CLOSE_PANEL",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
function __entitycomp_render() {
    return `
<h1>Entity</h1>
<button data-action="${__ACTIONS.CLOSE_PANEL}">Close</button>
id: <span class="entity-id"></span>
name: <span class="entity-name"></span>
room_id: <span class="entity-room-id"></span>
inventory: <div class="inventory"></div>
    `;
}

/**
 * @param {HTMLElement} el
 * @param {EntityID} entity_id
 */
function __entitycomp_update(el, entity_id) {
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
    return comp_create_comp_with_sub_comps(container, "entity-comp", (el, sub_comp_manager, add_cleanup) => {
        el.innerHTML = __entitycomp_render();

        const s = store_get();
        const entity = undefined_unwrap(repository_get(s.world.entity_repo, entity_id));

        const inventory_container = /**@type {HTMLElement}*/(el.querySelector(".inventory"));
        if (!inventory_container) throw new Error();
        subcompmanager_add(
            sub_comp_manager,
            __INVENTORY_KEY,
            inventorycomp_mount(inventory_container, entity.inventory_id));

        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __entitycomp_handle_action(action);
        }));

        add_cleanup(enginesignal_on("entity.name.changed", (payload) => {
            if (payload.entity_id === entity_id) __entitycomp_update(el, entity_id);
        }));
        add_cleanup(enginesignal_on("entity.room_id.changed", (payload) => {
            if (payload.entity_id === entity_id) __entitycomp_update(el, entity_id);
        }));

        __entitycomp_update(el, entity_id);
    });
}

/**
 * @param {Action} action
 */
function __entitycomp_handle_action(action) {
    switch (action) {
        case __ACTIONS.CLOSE_PANEL: {
            uisignal_emit(UI_SIGNAL.CLOSE_ENTITY_PANEL);
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
