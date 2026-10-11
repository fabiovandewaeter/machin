// engine/core/signal/signal.types.js

/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../../utils/enum.js";

/**
 * @typedef {import("../ids.types.js").EntityID} EntityID
 * @typedef {import("../../entity/entity.types.js").Entity} Entity
 * @typedef {import("../ids.types.js").RoomID} RoomID
 * @typedef {import("../../map/room/room.types.js").Room} Room
 */

const __TIME_SIGNAL = enum_create(/**@type {const}*/([
    "TICK",
]));
/**
 * @typedef {EnumKey<typeof __TIME_SIGNAL>} TimeSignal
 * @typedef {{
 * TICK: [],
 * }} TimeSignalPayload
 */

const __ENTITY_SIGNAL = enum_create(/**@type {const}*/([
    "ENTITY_BROKE",
]));
/**
 * @typedef {EnumKey<typeof __ENTITY_SIGNAL>} EntitySignal
 * @typedef {{
 * ENTITY_BROKE: [{entity_id: EntityID}],
 * }} EntitySignalPayload
 */

export const ENGINE_SIGNAL = Object.freeze(/**@type {const}*/({
    ...__TIME_SIGNAL,
    ...__ENTITY_SIGNAL,
}));
/**
 * @typedef {EnumKey<typeof ENGINE_SIGNAL>} BaseEngineSignal
 * @typedef {TimeSignalPayload & EntitySignalPayload } BaseEngineSignalPayload
 */
// ======================================================

/**
 * @typedef {BaseEngineSignalPayload
 *   & import("../../../utils/signal_bus.js").ChangedSignals<"entity", EntityID, Entity>
 *   & import("../../../utils/signal_bus.js").ChangedSignals<"room", RoomID, Room>
 * } EngineSignalPayload
 */
/** @typedef {keyof EngineSignalPayload} EngineSignal */
