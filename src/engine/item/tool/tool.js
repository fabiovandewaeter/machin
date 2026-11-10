// engine/item/tool/tool.js

/**
 * @typedef {import("./pickaxe.js").Pickaxe} Pickaxe
 */
/** @import { EnumKey } from "../../../utils/enum.js" */
import { enum_create } from "../../../utils/enum.js";

export const TOOL_KIND = enum_create(/**@type {const}*/([
    "PICKAXE",
]));
/**
 * @typedef {EnumKey<typeof TOOL_KIND>} ToolKind
 */

/**
 * @typedef {Pickaxe
 * } Tool
 */
