// engine/item/item.js

/** @typedef {import("./item.types.js").Item} Item */
import { materialitem_is_valid } from "./material/material_item.js";
import { pickaxe_is_valid } from "./tool/pickaxe.js";

/**
 * @param {unknown} value
 * @returns {value is Item}
 */
export function item_is_valid(value) {
    if (!value || typeof value !== "object") return false;
    const item = /** @type {Item} */ (value);
    return item.kind === "PICKAXE" ? pickaxe_is_valid(item) : materialitem_is_valid(item);
}
