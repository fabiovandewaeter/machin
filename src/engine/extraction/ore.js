// engine/extraction/ore.js

import { array_get } from "../../utils/array.js";
import { assert } from "../../utils/assert.js";
import { randomgenerator_next_int } from "../../utils/random_generator.js";
import { MATERIAL, MATERIAL_KIND } from "../item/material/material.js";
import { materialitem_create, materialitem_create_stack } from "../item/material/material_item.js";

/**
 * @typedef {import("../item/material/material.js").MaterialKind} MaterialKind
 * @typedef {import("../item/material/material_item.js").MaterialItemStack} MaterialItemStack
 * @typedef {import("../item/tool/tool.js").ToolKind} ToolKind
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../../utils/random_generator.js").RandomGenerator} RandomGenerator
 */

/**
 * @typedef {number & {readonly __brand:"__InternalOreID"}} __InternalOreID
 */

/**
 * @typedef {Object} Ore
 * @prop {__InternalOreID} internal_id
 * @prop {MaterialItemStack[]} composition
 * @prop {number} required_mining_level
 * @prop {ToolKind} tool_kind
 */

/**
 * @param {Object} options
 * @param {__InternalOreID} options.internal_id
 * @param {MaterialItemStack[]} options.composition
 * @returns {Ore}
 */
export function ore_create({ internal_id, composition }) {
    assert(composition.length > 0 && composition.every(stack => Number.isSafeInteger(stack.amount) && stack.amount >= 0),
        "Invalid ore composition");
    let max_mining_level = MATERIAL[array_get(composition, 0).material_item.material].mining_level;
    for (let i = 1; i < composition.length; i++) {
        const current_mining_level = MATERIAL[array_get(composition, i).material_item.material].mining_level;
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
 * @param {RandomGenerator} random_generator
 * @param {number} amount
 * @returns {Ore[]}
 */
export function ore_generate(random_generator, amount) {
    /** @type {Ore[]} */
    const ores = [];
    const materials = /** @type {MaterialKind[]} */ (Object.keys(MATERIAL_KIND));
    const max_amount = 20;
    for (let i = 0; i < amount; i++) {
        const material_index = randomgenerator_next_int(random_generator, materials.length);
        const random_amount = randomgenerator_next_int(random_generator, max_amount) + 1;

        const mi = materialitem_create({
            kind: "ORE",
            material: array_get(materials, material_index),
            quality: "NORMAL",
        });
        const stack = materialitem_create_stack(mi, random_amount);
        ores.push(ore_create({
            internal_id: /**@type {__InternalOreID} */(i),
            composition: [stack],
        }));
    }

    return ores;
}
