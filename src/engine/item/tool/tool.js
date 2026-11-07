// engine/item/tool/tool.js

/**
 * @typedef {import("./pickaxe.js").Pickaxe} Pickaxe
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
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
