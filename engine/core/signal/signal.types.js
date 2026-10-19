// engine/core/signal/signal.types.js

/**
 * @typedef {import("../ids.types.js").EntityID} EntityID
 * @typedef {import("../../entity/entity.types.js").Entity} Entity
 * @typedef {import("../ids.types.js").RoomID} RoomID
 * @typedef {import("../../map/room/room.types.js").Room} Room
 * @typedef {import("../../extraction/ore.js").InternalOreID} InternalOreID
 * @typedef {import("../ids.types.js").InventoryID} InventoryID
 * @typedef {import("../../inventory.js").InternalItemID} InternalItemID
 * @typedef {import("../../inventory.js").Inventory} Inventory
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
/** @template {string} Base @template Id @template {Record<string, unknown>} T @typedef {import("../../../utils/signal_bus.js").ChangedSignals<Base, Id, T>} ChangedSignals*/
import { enum_create } from "../../../utils/enum.js";

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
 *      & ChangedSignals<"entity", EntityID, Entity>
 *      & {
 *       "entity.items.modified": [{ entity_id: EntityID }],
 *      }
 *      & ChangedSignals<"room", RoomID, Room>
 *      & {
 *       "room.content.added": [{ room_id: RoomID, added: InternalOreID }],
 *       "room.content.removed": [{ room_id: RoomID, removed: InternalOreID }],
 *      }
 *      & {
 *       "inventory.item_stack.added": [{ inventory_id: InventoryID, added: InternalItemID }],
 *       "inventory.item_stack.removed": [{ inventory_id: InventoryID, removed: InternalItemID }],
 *      }
 * } EngineSignalPayload
 */
/** @typedef {keyof EngineSignalPayload} EngineSignal */
