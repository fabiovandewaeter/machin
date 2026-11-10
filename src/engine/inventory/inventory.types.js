// engine/inventory/inventory.types.js

/**
 * @typedef {import("../item/item.types.js").Item} Item
 * @typedef {import("../core/ids.types.js").InventoryID} InventoryID
 * @typedef {number & {readonly __brand:"__InternalItemID"}} __InternalItemID
 */

/**
 * @typedef {Object} ItemStack
 * @prop {__InternalItemID} id
 * @prop {Item} item
 * @prop {number} amount
 */

/**
 * @typedef {Object} Inventory
 * @prop {InventoryID} id
 * @prop {__InternalItemID} __current_internal_item_id
 * @prop {ItemStack[]} item_stack
 * @typedef {import("../../utils/repository.js").Repo<InventoryID, Inventory>} InventoryRepo
 */

export {};
