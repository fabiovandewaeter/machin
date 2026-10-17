// engine/inventory.js

/**
 * @typedef {import("./item/item.types").Item} Item
 */

/**
 * @typedef {number & {readonly __brand:"InternalItemID"}} InternalItemID
 */
/**
 * @typedef {Object} ItemStack
 * @property {InternalItemID} id
 * @property {Item} item
 */

/**
 * @typedef {Object} Inventory
 * @property {InternalItemID} __curent_id
 * @property {ItemStack[]} item_stack
 */

/**
 * @returns {Inventory}
 */
export function inventory_create() {
    return {
        __curent_id: /**@type {InternalItemID}*/(0),
        item_stack: []
    };
}

/**
 * @param {Inventory} inventory 
 * @param {Item} item 
 * @returns {InternalItemID}
 */
export function inventory_add_item(inventory, item) {
    const id = /**@type {InternalItemID} */ (inventory.__curent_id++);
    inventory.item_stack.push({ id, item });
    return id;
}
