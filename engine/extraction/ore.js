// engine/extraction/ore.js
// @ts-check

import { MATERIAL } from "../item/material/material";

/**
 * @typedef {import("../item/material/material").Material} Material
 * @typedef {import("../item/material/material_item").MaterialItem} MaterialItem
 * @typedef {import("../item/material/material_item").MaterialItemStack} MaterialItemStack
 * @typedef {import("../item/tool/tool").ToolKind} ToolKind
 * @typedef {import("../item/tool/tool").Tool} Tool
 */



/**
 * @typedef {Object} Ore
 * @property {MaterialItemStack[]} composition
 * @property {number} required_mining_level
 * @property {ToolKind} tool_kind
 */

/**
 * @param {Object} options
 * @param {MaterialItemStack[]} options.composition
 * @returns {Ore}
 */
export function ore_create({ composition }) {
    // required_mining_level est le mining_level le plus élevé de composition
    let max_mining_level = MATERIAL[composition[0].material_item.material].mining_level;
    for (let i = 1; i < composition.length; i++) {
        const current_mining_level = MATERIAL[composition[i].material_item.material].mining_level;
        if (current_mining_level > max_mining_level) {
            max_mining_level = current_mining_level;
        }
    }

    return {
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
