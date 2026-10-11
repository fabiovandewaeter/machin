// ui/core/ui_state/ui_state.types.js

/**
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 */
/** @template T @typedef {import("../../../utils/option.js").Opt<T>} Opt */

/**
 * @typedef {Object} UIState
 * @property {Scene} scene
 * @property {string[]} logs
 * @property {Opt<number>} tick_interval_id
 * @property {Opt<EntityID>} selected_entity_id
 */
