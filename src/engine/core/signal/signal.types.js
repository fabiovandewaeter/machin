// engine/core/signal/signal.types.js

/**
 * @import { EntityID, InventoryID, RoomID } from "../ids.types.js"
 * @import { __InternalOreID } from "../../extraction/ore.js"
 * @import { __InternalItemID } from "../../inventory/inventory.types.js"
 */

/**
 * @typedef {{
 *   TICK: [],
 *   "entity.name.changed": [{ entity_id: EntityID, previous_name: string, new_name: string }],
 *   "entity.room_id.changed": [{ entity_id: EntityID, previous_room_id: RoomID, new_room_id: RoomID }],
 *   "room.entities.added": [{ room_id: RoomID, added: EntityID }],
 *   "room.entities.removed": [{ room_id: RoomID, removed: EntityID }],
 *   "room.exits.set": [{ room_id: RoomID, key: string }],
 *   "room.exits.deleted": [{ room_id: RoomID, key: string }],
 *   "room.content.added": [{ room_id: RoomID, added: __InternalOreID }],
 *   "room.content.removed": [{ room_id: RoomID, removed: __InternalOreID }],
 *   "inventory.item_stack.added": [{ inventory_id: InventoryID, added: __InternalItemID }],
 *   "inventory.item_stack.removed": [{ inventory_id: InventoryID, removed: __InternalItemID }],
 * }} EngineSignalPayload
 */
/** @typedef {keyof EngineSignalPayload} EngineSignal */

export { };
