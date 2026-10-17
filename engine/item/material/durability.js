// engine/item/material/durability.js

import { assert } from "../../../tests/test.js";
import { BASE_COST } from "./durability.types.js";
import { MATERIAL } from "./material.js";

/**
 * @typedef {import("./material_item.js").MaterialItem} MaterialItem
 * @typedef {import("./material.js").MaterialKind} MaterialKind
 */

/**
 * @param {MaterialItem[]} material_items 
 * @param {MaterialKind} target
 * @throws {Error} si la target est impossible à miner
 */
export function durability_decrease_durability(material_items, target) {
    const target_material = MATERIAL[target];
    for (let material_item of material_items) {
        const current_material = MATERIAL[material_item.material];
        const diff = current_material.mining_level - target_material.mining_level;
        assert(diff >= 0);

        const cost = BASE_COST / (diff + 1);
        material_item.durability -= cost;
    }
}
