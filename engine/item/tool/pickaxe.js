// engine/item/tool/pickaxe.js

/**
 * @typedef {import("../material/material_item.js").MaterialItem} MaterialItem
 * @typedef {import("../material/material_item.js").MaterialItemKind} MaterialItemKind
 * @typedef {import("../quality.js").Quality} Quality
 * @typedef {import("../../action/action.js").ActionKind} ActionKind
 */
/** @template T, E @typedef {import("../../../utils/result.js").Res<T, E>} Res */
import { ok, result_is_err } from "../../../utils/result.js";
import { compatibility_are_all_same_material } from "../compatibility.js";
import { material_lowest_mining_level } from "../material/material.js";

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
 * @property {"PICKAXE"} kind
 * @property {Parts} parts
 * @property {number} mining_level
 * @property {ActionKind[]} compatible_actions
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

// TODO: progression manuel qui vont juste déterminer mining_level et durability et mining_speed PUIS avec moteurs où on peut mettre des modules
