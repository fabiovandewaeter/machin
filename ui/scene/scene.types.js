// ui/scene/scene.types.js

/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../utils/enum.js";

export const SCENES = enum_create(/**@type {const}*/([
    "MAIN",
    "MENU",
]));
/** @typedef {EnumKey<typeof SCENES>} Scene */
