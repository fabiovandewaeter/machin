// engine/item/material/material.js
// @ts-check

/**
 * @typedef {import("./category.js").MaterialCategory} MaterialCategory
 */
import { assert } from "../../../tests/test.js";
import * as Enum from "../../../utils/enum.js";

/**
 * @typedef {Object} MaterialDefinition
 * @property {string} kind
 * @property {MaterialCategory[]} categories
 * @property {number} mining_level
 */

// différentes roches voir si catégories pour les items ou alors propriété physiques style température fusion ???
/** @satisfies {Record<string, MaterialDefinition>} */
export const MATERIAL = Object.freeze(/**@type {const}*/({
    STONE: { kind: "STONE", categories: ["ROCK"], mining_level: 0 },
    COPPER: { kind: "COPPER", categories: ["METAL"], mining_level: 1 },
    IRON: { kind: "IRON", categories: ["METAL"], mining_level: 2 },
    BRONZE: { kind: "BRONZE", categories: ["METAL"], mining_level: 4 },
    STEEL: { kind: "STEEL", categories: ["METAL"], mining_level: 5 },
}));
/**
 * @typedef {EnumKey<typeof MATERIAL>} Material
 */

/**
 * @param {Material[]} materials
 * @returns {number}
 */
export function lowest_mining_level(materials) {
    assert(materials.length > 0);
    let lowest = MATERIAL[materials[0]].mining_level;
    for (let i = 1; i < materials.length; i++) {
        const current = MATERIAL[materials[i]].mining_level;
        if (current < lowest) {
            lowest = current;
        }
    }

    return lowest;
}
