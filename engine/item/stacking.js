// engine/item/stacking.js
// @ts-check

import { utils_data_key } from "../../utils/utils";



// TODO: voir si on fusionne avec MaterialItemStack de material_item.js

/**
 * @typedef {Object} ItemStack
 * @property {Item} item
 * @property {number} amount
 */

/** 
 * @param {Item} a
 * @param {Item} b
 * @returns {boolean}
 */
export function stacking_is_same_item(a, b) {
    return utils_data_key(a) === utils_data_key(b.data);  // même qualité/matériaux/durabilité = fusion
}

/** 
 * @param {ItemStack} a
 * @param {ItemStack} b
 * @returns {boolean}
 */
export function stacking_can_merge(a, b) {
    if (a.itemId !== b.itemId) return false;
    const def = ITEM_DEFINITIONS[a.itemId];
    if (def.maxStack <= 1) return false;        // épées etc: jamais fusionnables
    return utils_data_key(a.data) === utils_data_key(b.data);  // même qualité/matériaux/durabilité = fusion
}
