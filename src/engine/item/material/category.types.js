// engine/item/material/category.types.js

/** @import { EnumKey } from "../../../utils/enum.js" */
import { enum_create } from "../../../utils/enum.js";

// TODO:
// 1) régler import circulaire avec material.js
// 2) plus utiliser les modules genre Entity.create() mais faire entity_create() comme en C

const __MATERIAL_CATEGORY = enum_create(/**@type {const} */([
    "METAL",
    "ROCK",
    "CRISTAL",
]));
/**
 * @typedef {EnumKey<typeof __MATERIAL_CATEGORY>} MaterialCategory
 */
