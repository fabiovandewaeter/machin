// engine/core/signal/signal.types.js

/**
 * @import { EntityID, FlowConnectionID, InventoryID, MachineID, RoomID } from "../ids.types.js"
 * @import { RecipeID } from "../../item/recipe.js"
 * @import { __InternalNodeID } from "../ids.types.js"
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
 *   "room.content.added": [{ room_id: RoomID, added: __InternalNodeID }],
 *   "room.content.removed": [{ room_id: RoomID, removed: __InternalNodeID }],
 *   "inventory.item_stack.added": [{ inventory_id: InventoryID, added: __InternalItemID }],
 *   "inventory.item_stack.removed": [{ inventory_id: InventoryID, removed: __InternalItemID }],
 *   "room.machines.added": [{ room_id: RoomID, added: MachineID }],
 *   "room.machines.removed": [{ room_id: RoomID, removed: MachineID }],
 *   "machine.production.changed": [{ machine_id: MachineID }],
 *   "machine.recipe_id.changed": [{ machine_id: MachineID, previous_recipe_id: RecipeID|undefined, new_recipe_id: RecipeID|undefined }],
 *   "flow_connection.added": [{ flow_connection_id: FlowConnectionID }],
 *   "flow_connection.removed": [{ flow_connection_id: FlowConnectionID }],
 *   "flow_connection.manual_throughput_limit.changed": [{ flow_connection_id: FlowConnectionID }],
 *   "flow_connection.throughput.changed": [{ flow_connection_id: FlowConnectionID }],
 * }} EngineSignalPayload
 */
/** @typedef {keyof EngineSignalPayload} EngineSignal */

export { };
