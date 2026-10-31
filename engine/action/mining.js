// engine/action/mining.js

/**
 * @typedef {import("../extraction/ore.js").Ore} Ore
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../item/material/material_item.js").MaterialItemStack} MaterialItemStack
 */
/** @template T, E @typedef {import("../../utils/result.js").Res<T, E>} Res */
import { err, ok } from "../../utils/result.js";
import { ore_can_be_extracted } from "../extraction/ore.js";

/**
 * @param {Ore} ore
 * @param {Tool} tool
 * @returns {Res<MaterialItemStack[], string>}
 */
export function mining_mine(ore, tool) {
    if (!tool.compatible_actions.includes("MINING") || !ore_can_be_extracted(ore, tool)) {
        return err(`Tool cannot extract ore: ${tool.kind}, required level ${ore.required_mining_level}`);
    }
    if (!ore.composition.length || ore.composition.some(stack => !Number.isSafeInteger(stack.amount) || stack.amount < 0)) {
        return err("Invalid ore composition");
    }
    return ok(ore.composition.map(stack => ({ ...stack, material_item: { ...stack.material_item } })));
}
