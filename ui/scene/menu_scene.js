// ui/scene/menu_scene.js
// @ts-check

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */
import { enum_create, enum_is_enum_key } from "../../utils/enum.js";
import { signalbus_emit } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { utils_assert_unreachable } from "../../utils/utils.js";
import { comp_create_comp_with_sub_comps, comp_delegate_click_with_enum } from "../component/core/comp.js";
import { UISB, UI_SIGNAL } from "../core/signals.js";
import { store_get } from "../core/store.js";
import { uistate_add_log } from "../core/ui_state.js";
import { SCENES } from "./scene.js";

const ACTIONS = enum_create(/**@type {const}*/([
    "SWITCH_SCENE",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
function menuscene_render() {
    return `
<h1>Scene: Menu</h1>
<div id="controls">
    <button data-action=${ACTIONS.SWITCH_SCENE} data-scene="main">Switch to main</button>
</div>
    `;
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function menuscene_mount(container) {
    return comp_create_comp_with_sub_comps(container, "scene-menu", (el, sub_comps, add_cleanup) => {
        el.innerHTML = menuscene_render();

        add_cleanup(comp_delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            menuscene_handle_action(action, btn);
        }));
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function menuscene_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case ACTIONS.SWITCH_SCENE: {
            const s = store_get();
            const new_scene = btn.dataset.scene;
            if (new_scene) {
                if (!enum_is_enum_key(SCENES, new_scene)) throw new Error();
                s.ui_state.scene = new_scene;
                uistate_add_log(s.ui_state, `switch_scene: ${new_scene}`);
                signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene });
            }
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}
