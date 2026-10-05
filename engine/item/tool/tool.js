// engine/item/tool/tool.js
// @ts-check

import * as Enum from "../../../utils/enum.js";

export const TOOL_KIND = Enum.create(/**@type {const}*/([
    "PICKAXE",
]));
/**
 * @typedef {EnumKey<typeof TOOL_KIND>} ToolKind
 */

/**
 * @typedef {
 *      | import("./pickaxe").Pickaxe
 * } Tool
 */
