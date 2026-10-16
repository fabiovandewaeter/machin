// ui/core/ui_state/ui_state.types.js

/**
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 */

/**
 * @typedef {Object} UIState
 * @property {Scene} scene
 * @property {string[]} logs
 * @property {number|undefined} tick_interval_id
 * @property {EntityID|undefined} selected_entity_id
 */
