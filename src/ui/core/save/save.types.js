// ui/core/save/save.types.js

/**
 * @typedef {Pick<import("../ui_state/ui_state.types.js").UIState, "scene" | "selected_entity_id">} SavedUIState
 */

/**
 * @typedef {Object} GameSave
 * @prop {number} version
 * @prop {import("../../../engine/core/world/world.types.js").World} world
 * @prop {SavedUIState} ui_state
 */

export {};
