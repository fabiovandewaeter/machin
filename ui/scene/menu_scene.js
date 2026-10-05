// ui/scene/menu_scene.js
// @ts-check

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */
import "../../utils/types.js"
import * as Scene from "./scene.js";
import * as UIState from "../core/ui_state.js";
import * as Store from "../core/store.js";
import * as UISB from "../core/signals.js";
import * as SB from "../../utils/signal_bus.js";
import * as Enum from "../../utils/enum.js";
import * as Utils from "../../utils/utils.js";
import * as Comp from "../component/core/comp.js";

const ACTIONS = Enum.create(/**@type {const}*/([
    "SWITCH_SCENE",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
function render() {
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
export function mount(container) {
    return Comp.create_comp_with_sub_comps(container, "scene-menu", (el, sub_comps, add_cleanup) => {
        el.innerHTML = render();

        add_cleanup(Comp.delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            handle_action(action, btn);
        }));
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function handle_action(action, btn) {
    const s = Store.get();
    switch (action) {
        case ACTIONS.SWITCH_SCENE: {
            const s = Store.get();
            const new_scene = btn.dataset.scene;
            if (new_scene) {
                if (!Enum.is_enum_value(Scene.SCENES, new_scene)) throw new Error();
                s.ui_state.scene = new_scene;
                UIState.add_log(s.ui_state, `switch_scene: ${new_scene}`);
                SB.emit(UISB.BUS, UISB.UI_SIGNAL.SCENE_SWITCHED, { new_scene });
            }
            break;
        }
        default: {
            Utils.assert_unreachable(action);
        }
    }
}
