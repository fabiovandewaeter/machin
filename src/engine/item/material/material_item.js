// engine/item/material/material_item.js

/**
 * @typedef {import("../quality.js").Quality} Quality
 * @typedef {import("./material.js").MaterialKind} MaterialKind
 * @typedef {import("../../utils/gauge.js").Gauge} Gauge
 */
/** @import { EnumKey } from "../../../utils/enum.js" */
import { enum_create } from "../../../utils/enum.js";
import { QUALITY } from "../quality.js";
import { BASE_DURABILITY } from "./durability.types.js";
import { MATERIAL_KIND } from "./material.js";

// 1: items basiques (une plaque d'un certains materiau) (structure de donnée plate)
// 2: items qui viennent d'autres items (un moteur) (structure de donnée plate)
// 3: trucs composés d'items, on construit un support pour d'autes items (un véhicule modulaire) (structure de donnée profonde)
// Les alloy c'est en fonction des crafts aussi

/**
 * @typedef {Object} MaterialItem
 * @prop {MaterialItemKind} kind
 * @prop {MaterialKind} material
 * @prop {Quality} quality
 * @prop {number} durability
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
 * @param {MaterialKind} options.material 
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
 * @param {unknown} value
 * @returns {value is MaterialItem}
 */
export function materialitem_is_valid(value) {
    if (!value || typeof value !== "object") return false;
    const item = /** @type {MaterialItem} */ (value);
    return typeof item.kind === "string" && Object.hasOwn(MATERIAL_ITEM_KIND, item.kind)
        && typeof item.material === "string" && Object.hasOwn(MATERIAL_KIND, item.material)
        && typeof item.quality === "string" && Object.hasOwn(QUALITY, item.quality)
        && Number.isFinite(item.durability)
        && item.durability >= 0;
}

/**
 * @typedef {Object} MaterialItemStack
 * @prop {MaterialItem} material_item pas limité pour pouvoir faire des gisements de tout kind
 * @prop {number} amount
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
