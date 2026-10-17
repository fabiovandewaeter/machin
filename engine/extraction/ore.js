// engine/extraction/ore.js

import { MATERIAL, MATERIAL_KIND } from "../item/material/material.js";
import { MATERIAL_ITEM_KIND, materialitem_create, materialitem_create_stack } from "../item/material/material_item.js";

/**
 * @typedef {import("../item/material/material").MaterialKind} MaterialKind
 * @typedef {import("../item/material/material_item").MaterialItem} MaterialItem
 * @typedef {import("../item/material/material_item").MaterialItemKind} MaterialItemKind
 * @typedef {import("../item/material/material_item").MaterialItemStack} MaterialItemStack
 * @typedef {import("../item/tool/tool").ToolKind} ToolKind
 * @typedef {import("../item/tool/tool").Tool} Tool
 */

/**
 * @typedef {number & {readonly __brand:"InternalOreID"}} InternalOreID
 */

/**
 * @typedef {Object} Ore
 * @property {InternalOreID} internal_id
 * @property {MaterialItemStack[]} composition
 * @property {number} required_mining_level
 * @property {ToolKind} tool_kind
 */

/**
 * @param {Object} options
 * @param {InternalOreID} options.internal_id
 * @param {MaterialItemStack[]} options.composition
 * @returns {Ore}
 */
export function ore_create({ internal_id, composition }) {
    // required_mining_level est le mining_level le plus élevé de composition
    let max_mining_level = MATERIAL[composition[0].material_item.material].mining_level;
    for (let i = 1; i < composition.length; i++) {
        const current_mining_level = MATERIAL[composition[i].material_item.material].mining_level;
        if (current_mining_level > max_mining_level) {
            max_mining_level = current_mining_level;
        }
    }

    return {
        internal_id,
        composition,
        required_mining_level: max_mining_level,
        tool_kind: "PICKAXE",
    };
}

/**
 * @param {Ore} ore
 * @param {Tool} tool
 * @returns {boolean}
 */
export function ore_can_be_extracted(ore, tool) {
    if (tool.kind !== ore.tool_kind) return false;
    return tool.mining_level >= ore.required_mining_level;
}

/**
 * @param {number} amount 
 * @returns {Ore[]}
 */
export function random(amount) {
    /** @type {Ore[]} */
    let ores = [];
    let random = 0;
    let random_amount = 0;
    const size = Object.keys(MATERIAL_KIND).length;
    const max_amount = 20;
    for (let i = 0; i < amount; i++) {
        random = Math.floor(Math.random() * size);
        random_amount = Math.floor(Math.random() * (max_amount + 1));

        const mi = materialitem_create({
            kind: "ORE",
            material: /**@type {MaterialKind}*/(Object.keys(MATERIAL_KIND)[random]),
            quality: "NORMAL",
        });
        const stack = materialitem_create_stack(mi, random_amount);
        ores.push(ore_create({
            internal_id: /**@type {InternalOreID} */(i),
            composition: [stack],
        }));
    }

    return ores;
}
