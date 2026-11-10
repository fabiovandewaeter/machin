// engine/action/mining.js

/**
 * @import {Ore} from "../extraction/ore.js"
 * @import {Tool} from "../item/tool/tool.js"
 * @import {MaterialItemStack} from "../item/material/material_item.js"
 * @import {Res} from "../../utils/result.js"
 */
import { err, ok } from "../../utils/result.js";
import { ore_can_be_extracted } from "../extraction/ore.js";

/**
 * @param {Ore} ore
 * @param {Tool|undefined} tool
 * @returns {boolean}
 */
export function mining_can_mine(ore, tool) {
    return tool !== undefined && tool.compatible_actions.includes("MINING") && ore_can_be_extracted(ore, tool);
}

/**
 * @param {Ore} ore
 * @param {Tool} tool
 * @returns {Res<MaterialItemStack[], string>}
 */
export function mining_mine(ore, tool) {
    if (!mining_can_mine(ore, tool)) {
        return err(`Tool cannot extract ore: ${tool.kind}, required level ${ore.required_mining_level}`);
    }
    if (!ore.composition.length || ore.composition.some(stack => !Number.isSafeInteger(stack.amount) || stack.amount < 0)) {
        return err("Invalid ore composition");
    }
    return ok(ore.composition);
}
