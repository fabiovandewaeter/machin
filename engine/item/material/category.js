// engine/item/material/category.js
// @ts-check

/**
 * @typedef {import("./material").Material} Material
 */
import { MATERIAL } from "./material.js";
import * as Enum from "../../../utils/enum.js";

const MATERIAL_CATEGORY = Enum.create(/**@type {const} */([
    "METAL",
    "ROCK",
    "CRISTAL",
]));
/**
 * @typedef {EnumKey<typeof MATERIAL_CATEGORY>} MaterialCategory
 */

/**
 * @template {MaterialCategory} C
 * @typedef {{
 *   [K in Material]:
 *     C extends (typeof MATERIAL)[K]["categories"][number] ? K : never
 * }[Material]} MaterialsOfCategory
 */
