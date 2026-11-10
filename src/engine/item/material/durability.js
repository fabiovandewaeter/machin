// engine/item/material/durability.js

import { assert } from "../../../utils/assert.js";
import { BASE_COST } from "./durability.types.js";
import { MATERIAL } from "./material.js";

/**
 * @import {MaterialItem} from "./material_item.js"
 * @import {MaterialKind} from "./material.js"
 */

/**
 * @param {MaterialItem[]} material_items 
 * @param {MaterialKind} target
 * @throws {Error} si la target est impossible à miner
 */
export function durability_decrease_durability(material_items, target) {
    const target_level = MATERIAL[target].mining_level;
    const costs = material_items.map(material_item => {
        const diff = MATERIAL[material_item.material].mining_level - target_level;
        assert(diff >= 0, `Cannot mine ${target} with ${material_item.material}`);
        return BASE_COST / (diff + 1);
    });
    material_items.forEach((material_item, index) => {
        material_item.durability = Math.max(0, material_item.durability - costs[index]);
    });
}
