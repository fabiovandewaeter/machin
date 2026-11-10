// engine/map/room/room.types.js

/**
 * @import {EntityID} from "../../core/ids.types.js"
 * @import {RoomID} from "../../core/ids.types.js"
 * @import {Ore} from "../../extraction/ore.js"
 * @import {MachineRef} from "../../machine/machine.types.js"
 * @import {EnumKey} from "../../../utils/enum.js"
 * @import {Repo} from "../../../utils/repository.js"
 */
import { enum_create } from "../../../utils/enum.js";

export const ROOM_KIND = enum_create(/**@type {const}*/([
    "CITY",
    "RIVER",
    "FOREST",
    "MOUNTAIN",
]));
/** @typedef {EnumKey<typeof ROOM_KIND>} RoomKind */

/**
 * @typedef {Object} Room
 * @prop {RoomID} id
 * @prop {RoomKind} kind
 * @prop {string} name
 * @prop {number} layer
 * @prop {Record<string, RoomExit>} exits // "north", "portal"
 * @prop {EntityID[]} entities
 * @prop {Ore[]} content
 * @prop {MachineRef[]} machines
 *
 * @typedef {Repo<RoomID, Room>} RoomRepo
 */
// TODO: @prop {Atmosphere} default_atmosphere pour pouvoir retourner à ça quand on unseal

/**
 * Un seul sens, ajouter conditions passage, cooldown etc.
 * @typedef {Object} RoomExit
 * @prop {RoomID} target_id
 */

