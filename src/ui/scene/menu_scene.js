// ui/scene/menu_scene.js

/** @typedef {import("../component/core/utils.js").DestroyFunction} DestroyFunction */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../utils/enum.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "../component/core/comp.js";
import { store_get } from "../core/store/store.js";
import { scene_switch } from "./scene.ops.js";

const __ACTIONS = enum_create(/** @type {const} */ (["SWITCH_SCENE"]));
/** @typedef {EnumKey<typeof __ACTIONS>} Action */

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function menuscene_mount(container) {
    return comp_create_comp(container, "scene-menu", (element, add_cleanup) => {
        element.innerHTML = `
<h1>Scene: Menu</h1>
<div id="controls">
    <button data-action="${__ACTIONS.SWITCH_SCENE}" data-scene="MAIN">Switch to main</button>
</div>
        `;
        add_cleanup(comp_delegate_click_with_enum(element, __ACTIONS, (action, event, button) => {
            __menuscene_handle_action(action, button);
        }));
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} button
 */
function __menuscene_handle_action(action, button) {
    switch (action) {
        case __ACTIONS.SWITCH_SCENE:
            if (button.dataset.scene !== undefined) scene_switch(store_get().ui_state, button.dataset.scene);
            break;
        default:
            utils_assert_unreachable(action);
    }
}
