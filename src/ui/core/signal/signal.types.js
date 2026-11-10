// ui/core/signal/signal.types.js

/**
 * @import { EntityID } from "../../../engine/core/ids.types.js"
 * @import { Scene } from "../../scene/scene.types.js"
 */
import { enum_create } from "../../../utils/enum.js";

export const UI_SIGNAL = enum_create(/**@type {const} */([
    "LOGS",
    "GAME_REPLACING",
    "SCENE_SWITCHED",
    "TOGGLE_TICK",
    "OPEN_ENTITY_PANEL",
    "CLOSE_ENTITY_PANEL",
]));

/**
 * @typedef {{
 *   LOGS: [{ log: string }],
 *   GAME_REPLACING: [],
 *   SCENE_SWITCHED: [{ new_scene: Scene }],
 *   TOGGLE_TICK: [],
 *   OPEN_ENTITY_PANEL: [{ entity_id: EntityID }],
 *   CLOSE_ENTITY_PANEL: [],
 *   "ui_state.selected_entity_id.changed": [{ previous_selected_entity_id: EntityID | undefined, new_selected_entity_id: EntityID }],
 * }} UISignalPayload
 */
/** @typedef {keyof UISignalPayload} UISignal */
