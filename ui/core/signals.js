// ui/core/signals.js
// @ts-check

import { enum_create } from "../../utils/enum.js";
import { signalbus_create, signalbus_clear } from "../../utils/signal_bus.js";

/**
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 * @typedef {import("../../engine/map/room.js").RoomID} RoomID
 * @typedef {import("../scene/scene.js").Scene} Scene
 * @typedef {import("./ui_state.js").UIState} UIState
 */

const OTHER_SIGNAL = enum_create(/**@type {const} */([
    "TICK",
    "LOGS",
    "SCENE_SWITCHED",
    "TOGGLE_TICK",
    "TOGGLE_LOGS",
]));
/**
 * @typedef {EnumKey<typeof OTHER_SIGNAL>} OtherUISignal
 * @typedef {{
 * TICK: [],
 * LOGS:[{log: string}],
 * SCENE_SWITCHED: [{new_scene: Scene}]
 * TOGGLE_TICK:[],
 * TOGGLE_LOGS: [],
 * }} OtherUISignalPayload
 */

const MAIN_MENU_SIGNAL = enum_create(/**@type {const}*/([
    "OPEN_ENTITY_PANEL",
    "CLOSE_ENTITY_PANEL",
]));
/**
 * @typedef {EnumKey<typeof MAIN_MENU_SIGNAL>} MainMenuUISignal
 * @typedef {{
 * OPEN_ENTITY_PANEL: [{entity_id: EntityID}],
 * CLOSE_ENTITY_PANEL: [],
 * }} MainMenuUISignalPayload
 */

const ENTITY_SIGNAL = enum_create(/**@type {const}*/([
    "SELECTED_ENTITY_CHANGED",
]));
/**
 * @typedef {EnumKey<typeof ENTITY_SIGNAL>} EntityUISignal
 * @typedef {{
 * SELECTED_ENTITY_CHANGED: [{entity_id: EntityID}],
 * }} EntityUISignalPayload
 */

export const UI_SIGNAL = Object.freeze(/**@type {const}*/({
    ...OTHER_SIGNAL,
    ...MAIN_MENU_SIGNAL,
    ...ENTITY_SIGNAL,
}));
/**
 * @typedef {EnumKey<typeof UI_SIGNAL>} BaseUISignal
 * @typedef { EntityUISignalPayload & MainMenuUISignalPayload & OtherUISignalPayload } BaseUISignalPayload
 */

/**
 * @typedef {BaseUISignalPayload
 *   & import("../../utils/signal_bus.js").SingletonChangedSignals<"ui_state", UIState>
 * } UISignalPayload
 */
/** @typedef {keyof UISignalPayload} UISignal */

/**@type {import("../../utils/signal_bus.js").SignalBus<UISignal, UISignalPayload>} */
export const UISB = signalbus_create();

export function uisignals_init() {
    uisignals_clear_handlers();
}

export function uisignals_clear_handlers() {
    signalbus_clear(UISB);
}
