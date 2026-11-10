// engine/item/tool/pickaxe.js

/**
 * @typedef {import("../material/material_item.js").MaterialItem} MaterialItem
 * @typedef {import("../material/material_item.js").MaterialItemKind} MaterialItemKind
 * @typedef {import("../quality.js").Quality} Quality
 * @typedef {import("../../action/action.js").ActionKind} ActionKind
 */
/** @template T, E @typedef {import("../../../utils/result.js").Res<T, E>} Res */
import { ok, result_is_err } from "../../../utils/result.js";
import { ACTION_KIND } from "../../action/action.js";
import { compatibility_are_all_same_material } from "../compatibility.js";
import { material_lowest_mining_level } from "../material/material.js";
import { materialitem_is_valid } from "../material/material_item.js";

const __PARTS = /** @type {const} */ ({
    ROD: "ROD",
    HEAD: "HEAD",
});
/**
 * @typedef {{
 *   [K in keyof typeof __PARTS]: MaterialItem & { kind: typeof __PARTS[K] }
 * }} Parts
 */

/**
 * @typedef {Object} Pickaxe
 * @prop {"PICKAXE"} kind
 * @prop {Parts} parts
 * @prop {number} mining_level
 * @prop {ActionKind[]} compatible_actions
 */

/**
 * @param {Object} options
 * @param {Parts} options.parts
 * @returns {Res<Pickaxe, string>}
 */
export function pickaxe_craft({ parts }) {
    const material_items = [parts.HEAD, parts.ROD];
    const parts_res = compatibility_are_all_same_material(material_items);
    if (result_is_err(parts_res)) return parts_res;

    return ok({
        kind: "PICKAXE",
        parts: { ROD: { ...parts.ROD }, HEAD: { ...parts.HEAD } },
        mining_level: material_lowest_mining_level(material_items.map(mi => mi.material)),
        compatible_actions: ["MINING"],
    });
}

/**
 * @param {unknown} value
 * @returns {value is Pickaxe}
 */
export function pickaxe_is_valid(value) {
    if (!value || typeof value !== "object") return false;
    const pickaxe = /** @type {Pickaxe} */ (value);
    const parts = pickaxe.parts;
    return pickaxe.kind === "PICKAXE" && !!parts && typeof parts === "object"
        && materialitem_is_valid(parts.ROD) && parts.ROD.kind === "ROD"
        && materialitem_is_valid(parts.HEAD) && parts.HEAD.kind === "HEAD"
        && parts.ROD.material === parts.HEAD.material
        && pickaxe.mining_level === material_lowest_mining_level([parts.ROD.material, parts.HEAD.material])
        && Array.isArray(pickaxe.compatible_actions)
        && pickaxe.compatible_actions.every(action => typeof action === "string" && Object.hasOwn(ACTION_KIND, action));
}

// TODO: progression manuel qui vont juste déterminer mining_level et durability et mining_speed PUIS avec moteurs où on peut mettre des modules
