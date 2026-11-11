// engine/item/resource.js

/**
 * @import { EnumKey } from "../../utils/enum.js"
 * @import {MaterialItem} from "./material/material_item.js"
 */
import { enum_create } from "../../utils/enum.js";

export const RESOURCE_TAG = enum_create(/**@type {const} */([
    "SOLID",
    "LIQUID",
]));
/**
 * @typedef {EnumKey<typeof RESOURCE_TAG>} ResourceTag
 */

/**
 * @typedef {Object} ResourceDefinition
 * @prop {ResourceTag[]} tags
 * @prop {Pick<MaterialItem, "kind" | "material" | "quality">} [material_item]
 */

export const RESOURCE = Object.freeze(/** @satisfies {Record<string, ResourceDefinition>} */ ({
    STONE_ORE: { tags: ["SOLID"], material_item: { kind: "ORE", material: "STONE", quality: "NORMAL" } },
    COPPER_ORE: { tags: ["SOLID"], material_item: { kind: "ORE", material: "COPPER", quality: "NORMAL" } },
    IRON_ORE: { tags: ["SOLID"], material_item: { kind: "ORE", material: "IRON", quality: "NORMAL" } },
    COPPER_INGOT: { tags: ["SOLID"], material_item: { kind: "INGOT", material: "COPPER", quality: "NORMAL" } },
    IRON_INGOT: { tags: ["SOLID"], material_item: { kind: "INGOT", material: "IRON", quality: "NORMAL" } },
    BRONZE_INGOT: { tags: ["SOLID"], material_item: { kind: "INGOT", material: "BRONZE", quality: "NORMAL" } },
    WATER: { tags: ["LIQUID"] },
}));
/** @typedef {keyof typeof RESOURCE} ResourceID */

/**
 * @param {Pick<MaterialItem, "kind" | "material" | "quality">} material_item
 * @returns {ResourceID|undefined}
 */
export function resource_from_material_item({ kind, material, quality }) {
    for (const [resource_id, definition] of Object.entries(RESOURCE)) {
        const item = /** @type {ResourceDefinition} */ (definition).material_item;
        if (item?.kind === kind && item.material === material && item.quality === quality) return /** @type {ResourceID} */ (resource_id);
    }
    return undefined;
}

/**
 * @param {ResourceID} resource_id
 * @param {ResourceTag[]} tags
 * @returns {boolean}
 */
export function resource_has_any_tag(resource_id, tags) {
    return /** @type {ResourceDefinition} */ (RESOURCE[resource_id]).tags.some(tag => tags.includes(tag));
}
