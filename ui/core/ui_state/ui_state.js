// ui/core/ui_state/ui_state.js

/**
 * @typedef {import("./ui_state.types.js").UIState} UIState
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../save/save.types.js").SavedUIState} SavedUIState
 */
import { uisignal_emit } from "../signal/signal.js";
import { UI_SIGNAL } from "../signal/signal.types.js";

const __MAX_LOGS = 100;

/**
 * @param {Partial<SavedUIState>} [saved]
 * @returns {UIState}
 */
export function uistate_create(saved = {}) {
    return {
        scene: saved.scene ?? "MAIN",
        logs: [],
        selected_entity_id: saved.selected_entity_id,
    };
}

/**
 * @param {UIState} ui
 * @param {string} log
 */
export function uistate_add_log(ui, log) {
    ui.logs.push(log);
    if (ui.logs.length > __MAX_LOGS) ui.logs.splice(0, ui.logs.length - __MAX_LOGS);
    uisignal_emit(UI_SIGNAL.LOGS, { log });
}

/**
 * @param {UIState} ui
 * @param {EntityID} entity_id
 */
export function uistate_select_entity(ui, entity_id) {
    const previous_selected_entity_id = ui.selected_entity_id;
    if (previous_selected_entity_id === entity_id) return;
    ui.selected_entity_id = entity_id;
    uisignal_emit("ui_state.selected_entity_id.changed", {
        previous_selected_entity_id,
        new_selected_entity_id: entity_id,
    });
}
