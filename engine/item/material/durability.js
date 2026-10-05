// engine/item/material/durability.js
// @ts-check

import { assert } from "../../../tests/test";

/**
 * @typedef {import("./material_item").MaterialItem} MaterialItem
 * @typedef {import("./material").Material} Material
 */
import * as Material from "./material.js";

export const BASE_DURABILITY = 10000;
export const BASE_COST = Math.floor(BASE_DURABILITY / 100);

/**
 * @param {MaterialItem[]} material_items 
 * @param {Material} target
 * @throws {Error} si la target est impossible à miner
 */
export function decrease_durability(material_items, target) {
    const target_material = Material.MATERIAL[target];
    for (let material_item of material_items) {
        const current_material = Material.MATERIAL[material_item.material];
        const diff = current_material.mining_level - target_material.mining_level;
        assert(diff >= 0);

        const cost = BASE_COST / (diff + 1);
        material_item.durability -= cost;
    }
}
