// engine/item/tool/pickaxe.js
// @ts-check

/**
 * @typedef {import("../material/material_item.js").Material} Material
 * @typedef {import("../material/material_item.js").MaterialItem} MaterialItem
 * @typedef {import("../material/material_item.js").MaterialItemKind} MaterialItemKind
 * @typedef {import("../quality.js").Quality} Quality
 */
import "../../../utils/result.js";
import { err, ok } from "../../../utils/result.js";
import * as Quality from "../quality.js";
import * as Compatibility from "../compatibility.js";
import * as Res from "../../../utils/result.js";
import * as Material from "../material/material.js";
import * as Durability from "../material/durability.js";

const PARTS = /** @type {const} */ ({
    ROD: "ROD",
    HEAD: "HEAD",
});
/**
 * @typedef {{
 *   [K in keyof typeof PARTS]: MaterialItem & { kind: typeof PARTS[K] }
 * }} Parts
 */

/**
 * @typedef {Object} Pickaxe
 * @property {"PICKAXE"} kind
 * @property {Parts} parts
 * @property {number} mining_level
 */

/**
 * @param {Object} options
 * @param {Parts} options.parts
 * @returns {Res<Pickaxe, string>}
 */
export function craft({ parts }) {
    const material_items = [parts.HEAD, parts.ROD];
    const parts_res = Compatibility.are_all_same_material(material_items);
    if (Res.is_err(parts_res)) return parts_res;

    return ok({
        kind: "PICKAXE",
        parts,
        mining_level: Material.lowest_mining_level(material_items.map(mi => mi.material)),
    });
}

// TODO: progression manuel qui vont juste déterminer mining_level et durability et mining_speed PUIS avec moteurs où on peut mettre des modules
