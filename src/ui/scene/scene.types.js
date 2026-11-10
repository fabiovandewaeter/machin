// ui/scene/scene.types.js

/** @import { EnumKey } from "../../utils/enum.js" */
import { enum_create } from "../../utils/enum.js";

export const SCENES = enum_create(/**@type {const}*/([
    "MAIN",
    "MENU",
]));
/** @typedef {EnumKey<typeof SCENES>} Scene */
