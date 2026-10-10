// engine/item/tool/tool.js
// @ts-check

import { enum_create } from "../../../utils/enum";

export const TOOL_KIND = enum_create(/**@type {const}*/([
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
