// engine/item/tool/tool.js

/**
 * @import {Pickaxe} from "./pickaxe.js"
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
