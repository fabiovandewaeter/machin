// engine/item/item.js

/**
 * @typedef {import("./item.types.js").Item} Item
 * @typedef {import("./material/material_item.js").MaterialItem} MaterialItem
 */
import { ACTION_KIND } from "../action/action.js";
import { MATERIAL_KIND } from "./material/material.js";
import { MATERIAL_ITEM_KIND } from "./material/material_item.js";
import { QUALITY } from "./quality.js";

/**
 * @template {Item} T
 * @param {T} item
 * @returns {T}
 */
export function item_copy(item) {
    if (item.kind !== "PICKAXE") return { ...item };
    return {
        ...item,
        parts: { ROD: { ...item.parts.ROD }, HEAD: { ...item.parts.HEAD } },
        compatible_actions: [...item.compatible_actions],
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
 * @param {unknown} value
 * @returns {value is Item}
 */
export function item_is_valid(value) {
    if (!value || typeof value !== "object") return false;
    const item = /** @type {Item} */ (value);
    if (item.kind !== "PICKAXE") return materialitem_is_valid(value);
    return !!item.parts
        && materialitem_is_valid(item.parts.ROD) && item.parts.ROD.kind === "ROD"
        && materialitem_is_valid(item.parts.HEAD) && item.parts.HEAD.kind === "HEAD"
        && item.parts.ROD.material === item.parts.HEAD.material
        && Number.isFinite(item.mining_level) && item.mining_level >= 0
        && Array.isArray(item.compatible_actions)
        && item.compatible_actions.every(action => typeof action === "string" && Object.hasOwn(ACTION_KIND, action));
}
