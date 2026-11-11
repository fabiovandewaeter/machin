// engine/extraction/node.js

/**
 * @import {__InternalNodeID} from "../core/ids.types.js"
 * @import {ResourceID} from "../item/resource.js"
 * @import {LiquidNode, ResourceNode} from "./node.types.js"
 */
import { RESOURCE, resource_from_material_item, resource_has_any_tag } from "../item/resource.js";

/**
 * @param {Object} options
 * @param {__InternalNodeID} options.internal_id
 * @param {ResourceID} options.resource
 * @param {number} options.amount
 * @returns {LiquidNode}
 */
export function liquidnode_create({ internal_id, resource, amount }) {
    return { kind: "LIQUID", internal_id, resource, amount };
}

/**
 * @param {LiquidNode} node
 * @returns {boolean}
 */
export function liquidnode_is_valid(node) {
    return typeof node.resource === "string" && Object.hasOwn(RESOURCE, node.resource) && resource_has_any_tag(node.resource, ["LIQUID"])
        && Number.isSafeInteger(node.amount) && node.amount >= 0;
}

/**
 * @param {ResourceNode|undefined} node
 * @param {ResourceID} resource
 * @returns {boolean}
 */
export function node_has_resource(node, resource) {
    switch (node?.kind) {
        case "ORE": return node.composition.some(stack => stack.amount > 0 && resource_from_material_item(stack.material_item) === resource);
        case "LIQUID": return node.amount > 0 && node.resource === resource;
        default: return false;
    }
}
