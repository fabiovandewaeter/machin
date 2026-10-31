/**
 * @typedef {import("../item/item.types.js").Item} Item
 * @typedef {import("../core/ids.types.js").InventoryID} InventoryID
 * @typedef {number & {readonly __brand:"__InternalItemID"}} __InternalItemID
 */

/**
 * @typedef {Object} ItemStack
 * @property {__InternalItemID} id
 * @property {Item} item
 */

/**
 * @typedef {Object} Inventory
 * @property {InventoryID} id
 * @property {__InternalItemID} __current_intenal_item_id
 * @property {ItemStack[]} item_stack
 * @typedef {import("../../utils/repository.js").Repo<InventoryID, Inventory>} InventoryRepo
 */

export {};
