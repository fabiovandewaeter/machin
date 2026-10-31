// ui/scene/scene.ops.js

/**
 * @typedef {import("../core/ui_state/ui_state.types.js").UIState} UIState
 */
import { enum_is_enum_key } from "../../utils/enum.js";
import { uisignal_emit } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { uistate_add_log } from "../core/ui_state/ui_state.js";
import { SCENES } from "./scene.types.js";

/**
 * @param {UIState} ui_state 
 * @param {string} new_scene 
 */
export function scene_switch(ui_state, new_scene) {
    if (!enum_is_enum_key(SCENES, new_scene)) throw new Error(`new_scene: ${new_scene}`);
    if (ui_state.scene === new_scene) return;
    ui_state.scene = new_scene;
    uistate_add_log(ui_state, `switch_scene: ${new_scene}`);
    uisignal_emit(UI_SIGNAL.SCENE_SWITCHED, { new_scene });
}
