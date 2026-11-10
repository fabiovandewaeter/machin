// engine/inventory/inventory.types.js

/**
 * @import {Item} from "../item/item.types.js"
 * @import {InventoryID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */

/**
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
 * @typedef {Repo<InventoryID, Inventory>} InventoryRepo
 */

export {};
