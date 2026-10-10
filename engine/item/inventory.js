// engine/item/inventory.js
// @ts-check

/**
 * @typedef {import("./stacking").ItemStack} ItemStack
 */

/**
 * @typedef {Object} Inventory
 * @property {ItemStack[]} stacked_items
 */

/**
 * @returns {Inventory}
 */
export function inventory_create() {
    return {
        stacked_items: [],
    };
}
