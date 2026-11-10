import { array_get } from "../../../utils/array.js";
// engine/item/material/material.js

/**
 * @import {MaterialCategory} from "./category.types.js"
 */
/** @import { EnumKey } from "../../../utils/enum.js" */
import { assert } from "../../../utils/assert.js";
import { enum_create } from "../../../utils/enum.js";

export const MATERIAL_KIND = enum_create(/**@type {const} */([
    "STONE",
    "COPPER",
    "IRON",
    "BRONZE",
    "STEEL",
]));
/**
 * @typedef {EnumKey<typeof MATERIAL_KIND>} MaterialKind
 */

/**
 * @typedef {Object} MaterialDefinition
 * @prop {MaterialKind} kind
 * @prop {MaterialCategory[]} categories
 * @prop {number} mining_level
 */

// différentes roches voir si catégories pour les items ou alors propriété physiques style température fusion ???
/** @satisfies {Record<MaterialKind, MaterialDefinition>} */
export const MATERIAL = Object.freeze(/**@type {const}*/({
    STONE: { kind: "STONE", categories: ["ROCK"], mining_level: 0 },
    COPPER: { kind: "COPPER", categories: ["METAL"], mining_level: 1 },
    IRON: { kind: "IRON", categories: ["METAL"], mining_level: 2 },
    BRONZE: { kind: "BRONZE", categories: ["METAL"], mining_level: 4 },
    STEEL: { kind: "STEEL", categories: ["METAL"], mining_level: 5 },
}));
// /**
//  * @typedef {EnumKey<typeof MATERIAL>} Material
//  */

/**
 * @param {MaterialKind[]} materials
 * @returns {number}
 */
export function material_lowest_mining_level(materials) {
    assert(materials.length > 0);
    let lowest = MATERIAL[array_get(materials, 0)].mining_level;
    for (let i = 1; i < materials.length; i++) {
        const current = MATERIAL[array_get(materials, i)].mining_level;
        if (current < lowest) {
            lowest = current;
        }
    }

    return lowest;
}

/**
 * @template {MaterialCategory} C
 * @typedef {{
 *   [K in MaterialKind]:
 *     C extends (typeof MATERIAL)[K]["categories"][number] ? K : never
 * }[MaterialKind]} MaterialsOfCategory
 */
