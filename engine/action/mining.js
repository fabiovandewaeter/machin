// engine/action/mining.js

import { err, ok } from "../../utils/result.js";

/**
 * @typedef {import("../extraction/ore").Ore} Ore
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../item/material/material_item.js").MaterialItemStack} MaterialItemStack
 * @typedef {import("./action").ActionKind} ActionKind
 */
/** @template T, E @typedef {import("../../utils/result.js").Res<T, E>} Res */

/** @type {ActionKind} */
const __ACTION_KIND = "MINING";

/**
 * @param {Ore} ore 
 * @param {Tool} tool 
 * @returns {Res<MaterialItemStack[], string>}
 */
export function mining_mine(ore, tool) {
    if (!tool.compatible_actions.includes(__ACTION_KIND)) {
        return err(`Tool incompatible: ${tool.kind} ${__ACTION_KIND}`);
    }

    return ok(ore.composition);
}
