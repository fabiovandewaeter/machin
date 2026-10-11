// engine/item/material/material_item.js

/**
 * @typedef {import("../quality.js").Quality} Quality
 * @typedef {import("./material.js").Material} Material
 * @typedef {import("../../utils/gauge.js").Gauge} Gauge
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../../utils/enum.js";
import { BASE_DURABILITY } from "./durability.types.js";

// 1: items basiques (une plaque d'un certains materiau) (structure de donnée plate)
// 2: items qui viennent d'autres items (un moteur) (structure de donnée plate)
// 3: trucs composés d'items, on construit un support pour d'autes items (un véhicule modulaire) (structure de donnée profonde)
// Les alloy c'est en fonction des crafts aussi

/**
 * @typedef {Object} MaterialItem
 * @property {MaterialItemKind} kind
 * @property {Material} material
 * @property {Quality} quality
 * @property {number} durability
 */

export const MATERIAL_ITEM_KIND = enum_create(/**@type {const}*/([
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
export function materialitem_create({ kind, material, quality }) {
    return {
        kind,
        material,
        quality,
        durability: BASE_DURABILITY,
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
export function materialitem_create_stack(material_item, amount) {
    return {
        material_item,
        amount,
    };
}
