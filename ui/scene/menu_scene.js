// ui/scene/menu_scene.js


/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../utils/enum.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { comp_create_comp_with_sub_comps, comp_delegate_click_with_enum } from "../component/core/comp.js";
import { store_get } from "../core/store.js";
import { scene_switch } from "./scene.ops.js";

const __ACTIONS = enum_create(/**@type {const}*/([
    "SWITCH_SCENE",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
function __menuscene_render() {
    return `
<h1>Scene: Menu</h1>
<div id="controls">
    <button data-action=${__ACTIONS.SWITCH_SCENE} data-scene="MAIN">Switch to main</button>
</div>
    `;
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function menuscene_mount(container) {
    return comp_create_comp_with_sub_comps(container, "scene-menu", (el, sub_comps, add_cleanup) => {
        el.innerHTML = __menuscene_render();

        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __menuscene_handle_action(action, btn);
        }));
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function __menuscene_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case __ACTIONS.SWITCH_SCENE: {
            const s = store_get();
            const new_scene = btn.dataset.scene;
            if (new_scene != undefined) {
                // if (!enum_is_enum_key(SCENES, new_scene)) throw new Error();
                // s.ui_state.scene = new_scene;
                // uistate_add_log(s.ui_state, `switch_scene: ${new_scene}`);
                // signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene });
                scene_switch(s.ui_state, new_scene);
            }
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
