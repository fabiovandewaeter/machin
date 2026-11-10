// engine/item/compatibility.js

/**
 * @import {MaterialKind} from "./material/material.js"
 * @import {MaterialItem} from "./material/material_item.js"
 * @import {MaterialItemKind} from "./material/material_item.js"
 * @import {Res} from "../../utils/result.js"
 */
import { assert } from "../../utils/assert.js";
import { err, ok } from "../../utils/result.js";
import { array_get } from "../../utils/array.js";

/**
 * @param {MaterialItem[]} material_items 
 * @param {MaterialItemKind[]} parts
 * @returns {Res<void, string>}
 */
export function compatibility_are_material_items_and_parts_compatibles(material_items, parts) {
    const sorted_material_items = material_items.map(item => item.kind).sort();
    const sorted_template_parts = [...parts].sort();
    if (sorted_material_items.length !== parts.length) return err(`Mauvais nombre de parts: ${sorted_material_items.length} au lieu de ${parts.length}`);
    for (let i = 0; i < sorted_material_items.length; i++) {
        if (sorted_material_items[i] !== sorted_template_parts[i]) return err(`Parts différents: ${sorted_material_items[i]} au lieu de ${sorted_template_parts[i]}`);
    }

    return ok(undefined);
}

/**
 * @param {MaterialItem[]} material_items 
 * @returns {Res<MaterialKind, string>}
 */
export function compatibility_are_all_same_material(material_items) {
    assert(material_items.length > 0);
    const material = array_get(material_items, 0).material;
    for (const item of material_items) {
        if (item.material !== material) return err(`Tous les items doivent avoir le même Material: ${material} et ${item.material} sont différents`);
    }
    return ok(material);
}
