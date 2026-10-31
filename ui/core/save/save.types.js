// ui/core/save/save.types.js

/**
 * @typedef {Pick<import("../ui_state/ui_state.types.js").UIState, "scene" | "selected_entity_id">} SavedUIState
 */

/**
 * @typedef {Object} GameSave
 * @property {number} version
 * @property {import("../../../engine/core/world/world.types.js").World} world
 * @property {SavedUIState} ui_state
 */

export {};
