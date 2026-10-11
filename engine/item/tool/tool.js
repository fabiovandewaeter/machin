// engine/item/tool/tool.js

/**
 * @template {Record<string, unknown>} T
 * @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey
 */
import { enum_create } from "../../../utils/enum.js";

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
