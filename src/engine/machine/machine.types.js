// engine/machine/machine.types.js

/**
 * @import { EnumKey } from "../../utils/enum.js"
 * @import {Repo} from "../../utils/repository.js"
 * @import {MachineID, RoomID} from "../core/ids.types.js"
 * @import {__InternalNodeID} from "../core/ids.types.js"
 * @import {RecipeID, ResourceAmount} from "../item/recipe.js"
 */
import { enum_create } from "../../utils/enum.js";

export const MACHINE_KIND = enum_create(/**@type {const} */([
    "EXTRACTOR",
    "PUMP",
    "FURNACE",
]));
/**
 * @typedef {EnumKey<typeof MACHINE_KIND>} MachineKind
 */

/**
 * @typedef {Object} MachineDefinition
 * @prop {boolean} placed_on_node
 * @prop {RecipeID[]} recipes
 */

/**
 * @typedef {Object} Machine
 * @prop {MachineID} id
 * @prop {MachineKind} kind
 * @prop {RoomID} room_id
 * @prop {__InternalNodeID|undefined} node_id
 * @prop {RecipeID|undefined} recipe_id
 * @prop {ResourceAmount[]} production
 *
 * @typedef {Repo<MachineID, Machine>} MachineRepo
 */
