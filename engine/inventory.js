// engine/inventory.js

import { repository_get, repository_spawn_element } from "../utils/repository.js";
import { undefined_unwrap } from "../utils/undefined.js";
import { enginesignal_emit } from "./core/signal/signal.js";

/**
 * @typedef {import("./item/item.types.js").Item} Item
 * @typedef {import("./core/ids.types.js").InventoryID} InventoryID
 */

/**
 * @typedef {Object} ItemStack
 * @property {__InternalItemID} id
 * @property {Item} item
 * 
 * @typedef {number & {readonly __brand:"__InternalItemID"}} __InternalItemID
 */

/**
 * @typedef {Object} Inventory
 * @property {InventoryID} id
 * @property {__InternalItemID} __current_intenal_item_id
 * @property {ItemStack[]} item_stack
 * 
 * @typedef {import("../utils/repository.js").Repo<InventoryID, Inventory>} InventoryRepo
 */

/**
 * @param {InventoryRepo} repo 
 * @returns {Inventory}
 */
export function inventory_spawn(repo) {
    return repository_spawn_element(repo, {
        __current_intenal_item_id: /**@type {__InternalItemID}*/(0),
        item_stack: [],
    });
}

/**
 * @param {InventoryRepo} repo
 * @param {InventoryID} id
 * @param {Item} item 
 * @returns {__InternalItemID}
 */
export function inventory_add_item(repo, id, item) {
    const inventory = undefined_unwrap(repository_get(repo, id));
    const internal_id = /**@type {__InternalItemID} */ (inventory.__current_intenal_item_id++);
    inventory.item_stack.push({ id: internal_id, item });
    enginesignal_emit("inventory.item_stack.added", {
        inventory_id: id,
        added: internal_id,
    });
    return internal_id;
}
