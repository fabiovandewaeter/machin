// engine/item/material/material_item.js
// @ts-check

// 1: items basiques (une plaque d'un certains materiau) (structure de donnée plate)
// 2: items qui viennent d'autres items (un moteur) (structure de donnée plate)
// 3: trucs composés d'items, on construit un support pour d'autes items (un véhicule modulaire) (structure de donnée profonde)

// Les alloy c'est en fonction des crafts aussi

/**
 * @typedef {import("../quality.js").Quality} Quality
 * @typedef {import("./material.js").Material} Material
 * @typedef {import("../../utils/gauge.js").Gauge} Gauge
 */
import * as Enum from "../../../utils/enum.js";
import * as Durability from "./durability.js";

/**
 * @typedef {Object} MaterialItem
 * @property {MaterialItemKind} kind
 * @property {Material} material
 * @property {Quality} quality
 * @property {number} durability
 */

export const MATERIAL_ITEM_KIND = Enum.create(/**@type {const}*/([
    "ORE",
    "INGOT",
    "PLATE",
    "ROD",
    "GEAR",
    "WIRE",

    "HEAD",
    "BLADE", // pour couper
    // truc pour percer, ecraser etc.
]));
/** 
 * @typedef {EnumKey<typeof MATERIAL_ITEM_KIND>} MaterialItemKind
 */

/**
 * @template {MaterialItemKind} K
 * @param {Object} options
 * @param {K} options.kind 
 * @param {Material} options.material 
 * @param {Quality} options.quality
 * @returns {MaterialItem & {kind: K}}
 */
export function create({ kind, material, quality }) {
    return {
        kind,
        material,
        quality,
        durability: Durability.BASE_DURABILITY,
    };
}

/**
 * @typedef {Object} MaterialItemStack
 * @property {MaterialItem} material_item pas limité pour pouvoir faire des gisements de tout kind
 * @property {number} amount
 */

/**
 * @param {MaterialItem} material_item
 * @param {number} amount
 * @returns {MaterialItemStack}
 */
export function create_stack(material_item, amount) {
    return {
        material_item,
        amount,
    };
}
