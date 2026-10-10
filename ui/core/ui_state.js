// ui/core/ui_state.js
// @ts-check

/**
 * @typedef {import("../scene/scene.js").Scene} Scene
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 */
import { none, option_is_some } from "../../utils/option.js";
import { signalbus_emit } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { UISB, UI_SIGNAL } from "./signals.js";

/**
 * @typedef {Object} UIState
 * @property {Scene} scene
 * @property {string[]} logs
 * @property {Opt<number>} tick_interval_id
 * @property {Opt<EntityID>} selected_entity_id
 */

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
