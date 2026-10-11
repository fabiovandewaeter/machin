// ui/core/signal/signal.types.js

/**
 * @typedef {import("../../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../../engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../scene/scene.types.js").Scene} Scene
 * @typedef {import("../ui_state/ui_state.types.js").UIState} UIState
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../../utils/enum.js";

const __OTHER_SIGNAL = enum_create(/**@type {const} */([
    "TICK",
    "LOGS",
    "SCENE_SWITCHED",
    "TOGGLE_TICK",
    "TOGGLE_LOGS",
]));
/**
 * @typedef {EnumKey<typeof __OTHER_SIGNAL>} OtherUISignal
 * @typedef {{
 * TICK: [],
 * LOGS:[{log: string}],
 * SCENE_SWITCHED: [{new_scene: Scene}]
 * TOGGLE_TICK:[],
 * TOGGLE_LOGS: [],
 * }} OtherUISignalPayload
 */

const __MAIN_MENU_SIGNAL = enum_create(/**@type {const}*/([
    "OPEN_ENTITY_PANEL",
    "CLOSE_ENTITY_PANEL",
]));
/**
 * @typedef {EnumKey<typeof __MAIN_MENU_SIGNAL>} MainMenuUISignal
 * @typedef {{
 * OPEN_ENTITY_PANEL: [{entity_id: EntityID}],
 * CLOSE_ENTITY_PANEL: [],
 * }} MainMenuUISignalPayload
 */

const __ENTITY_SIGNAL = enum_create(/**@type {const}*/([
    "SELECTED_ENTITY_CHANGED",
]));
/**
 * @typedef {EnumKey<typeof __ENTITY_SIGNAL>} EntityUISignal
 * @typedef {{
 * SELECTED_ENTITY_CHANGED: [{entity_id: EntityID}],
 * }} EntityUISignalPayload
 */

export const UI_SIGNAL = Object.freeze(/**@type {const}*/({
    ...__OTHER_SIGNAL,
    ...__MAIN_MENU_SIGNAL,
    ...__ENTITY_SIGNAL,
}));
/**
 * @typedef {EnumKey<typeof UI_SIGNAL>} BaseUISignal
 * @typedef { EntityUISignalPayload & MainMenuUISignalPayload & OtherUISignalPayload } BaseUISignalPayload
 */

/**
 * @typedef {BaseUISignalPayload
 *   & import("../../../utils/signal_bus.js").SingletonChangedSignals<"ui_state", UIState>
 * } UISignalPayload
 */
/** @typedef {keyof UISignalPayload} UISignal */
