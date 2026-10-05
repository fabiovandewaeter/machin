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
export function create() {
    return {
        stacked_items: [],
    };
}
