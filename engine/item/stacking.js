// engine/item/stacking.js
// @ts-check

import * as Utils from "../../utils/utils.js";

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
export function is_same_item(a, b) {
    return Utils.data_key(a) === Utils.data_key(b.data);  // même qualité/matériaux/durabilité = fusion
}

/** 
 * @param {ItemStack} a
 * @param {ItemStack} b
 * @returns {boolean}
 */
export function can_merge(a, b) {
    if (a.itemId !== b.itemId) return false;
    const def = ITEM_DEFINITIONS[a.itemId];
    if (def.maxStack <= 1) return false;        // épées etc: jamais fusionnables
    return Utils.data_key(a.data) === Utils.data_key(b.data);  // même qualité/matériaux/durabilité = fusion
}
