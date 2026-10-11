// ui/core/store.js


/**
 * @typedef {import("../../engine/core/world/world.js").World} World
 * @typedef {import("./ui_state/ui_state.js").UIState} UIState
 */
import { world_create } from "../../engine/core/world/world.js";

import { uistate_create } from "./ui_state/ui_state.js";

/**
 * @typedef {Object} GameStore
 * @property {World} world
 * @property {UIState} ui_state
 * @property {boolean} should_save
 */

/** @type {GameStore} */
let store = {
    world: world_create(),
    ui_state: uistate_create(),
    should_save: true,
};

/** @returns {GameStore} */
export function store_get() { return store; }

/** @param {World} new_world */
export function store_set_world(new_world) { store.world = new_world; }
/** @param {UIState} new_ui_state */
export function store_set_ui_state(new_ui_state) { store.ui_state = new_ui_state; }
/** @param {boolean} val */
export function store_set_should_save(val) { store.should_save = val; }
