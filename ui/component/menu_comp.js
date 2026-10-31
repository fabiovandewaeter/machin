// ui/component/menu_comp.js

/**
 * @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction
 * @typedef {import("./core/sub_comp_manager.js").SubCompKey} SubCompKey
 * @typedef {import("./core/sub_comp_manager.js").SubCompManager} SubCompManager
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../utils/enum.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { store_get } from "../core/store/store.js";
import { uistate_add_log } from "../core/ui_state/ui_state.js";
import { comp_create_comp_with_sub_comps, comp_delegate_click_with_enum } from "./core/comp.js";
import { subcompmanager_mount_or_toggle } from "./core/sub_comp_manager.js";
import { timecomp_mount } from "./time_comp.js";

/**@type {SubCompKey} */
const __TIME_KEY = "time";

const __ACTIONS = enum_create(/**@type {const}*/([
    "TOGGLE_TIME",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function menucomp_render() {
    return `
<button data-action="${__ACTIONS.TOGGLE_TIME}" data-spawn="true">Spawn time</button>
    `;
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function menucomp_mount(container) {
    return comp_create_comp_with_sub_comps(container, "menu-comp", (el, sub_comp_manager, add_cleanup) => {
        el.innerHTML = menucomp_render();

        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __menucomp_handle_action(action, btn, sub_comp_manager, el);
        }));
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 * @param {SubCompManager} sub_comp_manager
 * @param {HTMLElement} el
 */
function __menucomp_handle_action(action, btn, sub_comp_manager, el) {
    const s = store_get();
    switch (action) {
        case __ACTIONS.TOGGLE_TIME: {
            const visible = subcompmanager_mount_or_toggle(sub_comp_manager, __TIME_KEY, () => timecomp_mount(el));
            btn.textContent = visible ? "Hide time" : "Spawn time";
            uistate_add_log(s.ui_state, "toggle_time");
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
