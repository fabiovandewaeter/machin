// engine/extraction/node.types.js

/**
 * @import {__InternalNodeID} from "../core/ids.types.js"
 * @import {ResourceID} from "../item/resource.js"
 * @import {Ore} from "./ore.js"
 */

/**
 * @typedef {Object} LiquidNode
 * @prop {"LIQUID"} kind
 * @prop {__InternalNodeID} internal_id
 * @prop {ResourceID} resource
 * @prop {number} amount
 */

/**
 * @typedef {Ore | LiquidNode} ResourceNode
 */

export { };
