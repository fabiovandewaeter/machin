// ui/core/ui_state/ui_state.types.js

/**
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 */

/**
 * @typedef {Object} UIState
 * @prop {Scene} scene
 * @prop {string[]} logs
 * @prop {EntityID|undefined} selected_entity_id
 */
