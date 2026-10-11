// engine/map/room/room.types.js

/**
 * @typedef {import("../../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../core/ids.types.js").RoomID} RoomID
 * @typedef {import("../atmosphere.js").Atmosphere} Atmosphere
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
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
 * @property {RoomID} id
 * @property {RoomKind} kind
 * @property {string} name
 * @property {number} layer
 * @property {Record<string, RoomExit>} exits // "north", "portal"
 * @property {EntityID[]} entities
 * @property {Atmosphere} default_atmosphere pour pouvoir retourner à ça quand on unseal
 * 
 * @typedef {import("../../../utils/repository.js").Repo<RoomID, Room>} RoomRepo
 */

/**
 * Un seul sens, ajouter conditions passage, cooldown etc.
 * @typedef {Object} RoomExit
 * @property {RoomID} target_id
 */
