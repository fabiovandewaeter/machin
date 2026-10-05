// engine/core/signals.js
// @ts-check

import * as SB from "../../utils/signal_bus.js";
import * as Enum from "../../utils/enum.js";

/**
 * @typedef {import("../entity/entity.js").EntityID} EntityID
 * @typedef {import("../entity/entity.js").Entity} Entity
 * @typedef {import("../map/room.js").RoomID} RoomID
 * @typedef {import("../map/room.js").Room} Room
 */

const TIME_SIGNAL = Enum.create(/**@type {const}*/([
    "TICK",
]));
/**
 * @typedef {EnumKey<typeof TIME_SIGNAL>} TimeSignal
 * @typedef {{
 * TICK: [],
 * }} TimeSignalPayload
 */

const ENTITY_SIGNAL = Enum.create(/**@type {const}*/([
    "ENTITY_BROKE",
]));
/**
 * @typedef {EnumKey<typeof ENTITY_SIGNAL>} EntitySignal
 * @typedef {{
 * ENTITY_BROKE: [{entity_id: EntityID}],
 * }} EntitySignalPayload
 */

export const SIGNAL = Object.freeze(/**@type {const}*/({
    ...TIME_SIGNAL,
    ...ENTITY_SIGNAL,
}));
/**
 * @typedef {EnumKey<typeof SIGNAL>} BaseEngineSignal
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
export const BUS = SB.create();

export function init() {
    clear_handlers();
}

export function clear_handlers() {
    SB.clear(BUS);
}
