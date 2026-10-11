// ui/core/ui_state/ui_state.js

/**
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("./ui_state.types.js").UIState} UIState
 */
/** @template T @typedef {import("../../../utils/option.js").Opt<T>} Opt */
import { none, option_is_some } from "../../../utils/option.js";
import { signalbus_emit } from "../../../utils/signal_bus.js";
import { UISB } from "../signal/signal.js";
import { UI_SIGNAL } from "../signal/signal.types.js";

/**
 * @returns {UIState}
 */
export function uistate_create() {
    return {
        scene: "MAIN",
        logs: [],
        tick_interval_id: none,
        selected_entity_id: none,
    };
}

/**
 * @param {UIState} ui 
 * @param {string} log 
 */
export function uistate_add_log(ui, log) { ui.logs.push(log); signalbus_emit(UISB, UI_SIGNAL.LOGS, { log }); }

/**
 * @param {UIState} ui
 */
export function uistate_stop_tick(ui) {
    // if (ui.tick_interval_id !== null) {
    if (option_is_some(ui.tick_interval_id)) {
        clearInterval(ui.tick_interval_id.value);
        ui.tick_interval_id = none;
    }
}
