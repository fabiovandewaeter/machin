// ui/core/ui_state.js
// @ts-check

/**
 * @typedef {import("../scene/scene.js").Scene} Scene
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 */
import "../../utils/types.js"
import * as UISB from "./signals.js";
import * as SB from "../../utils/signal_bus.js";
import * as Opt from "../../utils/option.js";

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
export function create() {
    return {
        scene: "MAIN",
        logs: [],
        tick_interval_id: Opt.none,
        selected_entity_id: Opt.none,
    };
}

/**
 * @param {UIState} ui 
 * @param {string} log 
 */
export function add_log(ui, log) { ui.logs.push(log); SB.emit(UISB.BUS, UISB.UI_SIGNAL.LOGS, { log }); }

/**
 * @param {UIState} ui
 */
export function stop_tick(ui) {
    // if (ui.tick_interval_id !== null) {
    if (Opt.is_some(ui.tick_interval_id)) {
        clearInterval(ui.tick_interval_id.value);
        ui.tick_interval_id = Opt.none;
    }
}
