// ui/core/ui_state/ui_state.js

/**
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("./ui_state.types.js").UIState} UIState
 */
import { signalbus_emit } from "../../../utils/signal_bus.js";
import { uisignal_emit } from "../signal/signal.js";
import { UI_SIGNAL } from "../signal/signal.types.js";

/**
 * @returns {UIState}
 */
export function uistate_create() {
    return {
        scene: "MAIN",
        logs: [],
        tick_interval_id: undefined,
        selected_entity_id: undefined,
    };
}

/**
 * @param {UIState} ui 
 * @param {string} log 
 */
export function uistate_add_log(ui, log) {
    ui.logs.push(log);
    uisignal_emit(UI_SIGNAL.LOGS, { log });
}

/**
 * @param {UIState} ui
 */
export function uistate_stop_tick(ui) {
    // if (ui.tick_interval_id !== null) {
    if (ui.tick_interval_id != undefined) {
        clearInterval(ui.tick_interval_id);
        ui.tick_interval_id = undefined;
    }
}
