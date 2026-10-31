// engine/inventory/inventory.js

import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { enginesignal_emit } from "../core/signal/signal.js";
import { item_copy } from "../item/item.js";

/**
 * @typedef {import("../item/item.types.js").Item} Item
 * @typedef {import("../core/ids.types.js").InventoryID} InventoryID
 * @typedef {import("./inventory.types.js").__InternalItemID} __InternalItemID
 * @typedef {import("./inventory.types.js").Inventory} Inventory
 * @typedef {import("./inventory.types.js").InventoryRepo} InventoryRepo
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
    if (!Number.isSafeInteger(inventory.__current_intenal_item_id) || inventory.__current_intenal_item_id < 0 || inventory.__current_intenal_item_id >= Number.MAX_SAFE_INTEGER) {
        throw new RangeError("Inventory item ID limit reached");
    }
    const stored_item = item_copy(item);
    const internal_id = /**@type {__InternalItemID} */ (inventory.__current_intenal_item_id++);
    inventory.item_stack.push({ id: internal_id, item: stored_item });
    enginesignal_emit("inventory.item_stack.added", {
        inventory_id: id,
        added: internal_id,
    });
    return internal_id;
}
