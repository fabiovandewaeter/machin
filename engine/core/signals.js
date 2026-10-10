// engine/core/signals.js
// @ts-check

import { enum_create } from "../../utils/enum.js";
import { signalbus_clear, signalbus_create } from "../../utils/signal_bus.js";

/**
 * @typedef {import("../entity/entity.js").EntityID} EntityID
 * @typedef {import("../entity/entity.js").Entity} Entity
 * @typedef {import("../map/room.js").RoomID} RoomID
 * @typedef {import("../map/room.js").Room} Room
 */

const TIME_SIGNAL = enum_create(/**@type {const}*/([
    "TICK",
]));
/**
 * @typedef {EnumKey<typeof TIME_SIGNAL>} TimeSignal
 * @typedef {{
 * TICK: [],
 * }} TimeSignalPayload
 */

const ENTITY_SIGNAL = enum_create(/**@type {const}*/([
    "ENTITY_BROKE",
]));
/**
 * @typedef {EnumKey<typeof ENTITY_SIGNAL>} EntitySignal
 * @typedef {{
 * ENTITY_BROKE: [{entity_id: EntityID}],
 * }} EntitySignalPayload
 */

export const ENGINE_SIGNAL = Object.freeze(/**@type {const}*/({
    ...TIME_SIGNAL,
    ...ENTITY_SIGNAL,
}));
/**
 * @typedef {EnumKey<typeof ENGINE_SIGNAL>} BaseEngineSignal
 * @typedef {TimeSignalPayload & EntitySignalPayload } BaseEngineSignalPayload
 */
// ======================================================

/**
 * @typedef {BaseEngineSignalPayload
 *   & import("../../utils/signal_bus.js").ChangedSignals<"entity", EntityID, Entity>
 *   & import("../../utils/signal_bus.js").ChangedSignals<"room", RoomID, Room>
 * } EngineSignalPayload
 */
/** @typedef {keyof EngineSignalPayload} EngineSignal */

/** @type {import("../../utils/signal_bus.js").SignalBus<EngineSignal, EngineSignalPayload>} */
export const ESB = signalbus_create();

export function enginesignals_init() {
    enginesignals_clear_handlers();
}

export function enginesignals_clear_handlers() {
    signalbus_clear(ESB);
}
