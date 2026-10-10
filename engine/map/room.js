// engine/map/room.js
// @ts-check

/**
 * @typedef {import("../entity/entity.js").EntityID} EntityID
 * @typedef {import("./atmosphere.js").Atmosphere} Atmosphere
 */
import { enum_create } from "../../utils/enum.js";
import { option_unwrap } from "../../utils/option.js";
import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { signalbus_emit } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { undefined_unwrap } from "../../utils/undefined.js";
import { ESB } from "../core/signals.js";

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
 * @typedef {number & {readonly __brand:"RoomID"}} RoomID
 * @typedef {import("../../utils/repository.js").Repo<RoomID, Room>} RoomRepo
 */

/**
 * Un seul sens, ajouter conditions passage, cooldown etc.
 * @typedef {Object} RoomExit
 * @property {RoomID} target_id
 */

/**
 * @param {RoomRepo} repo
 * @param {Object} options
 * @param {RoomKind} options.kind
 * @param {string} options.name
 * @param {number} options.layer
 * @returns {Room}
 */
export function room_spawn(repo, { kind, name, layer }) {
    return repository_spawn_element(repo, {
        kind,
        name,
        layer,
        exits: {},
        entities: [],
    });
}

/**
 * @param {RoomRepo} repo 
 * @param {RoomID} id
 * @param {string} name
 * @param {RoomExit} exit 
 */
export function room_add_exit(repo, id, name, exit) {
    const room = undefined_unwrap(repository_get(repo, id));
    if (Object.keys(room.exits).includes(name)) throw new Error(`exit name already used for this room: ${room.id} ${name}`);
    room.exits[name] = exit;
    signalbus_emit(ESB, "room.exits.set", {
        room_id: id,
        key: name,
    });
}

/**
 * passer par méthodes du World à la place
 * @param {RoomRepo} repo 
 * @param {RoomID} id
 * @param {EntityID} entity_id
 */
export function room_add_entity(repo, id, entity_id) {
    const room = undefined_unwrap(repository_get(repo, id));
    if (room.entities.includes(entity_id)) throw new Error(`entity_id already in this room: ${room.id} ${entity_id}`);
    room.entities.push(entity_id);
    signalbus_emit(ESB, "room.entities.added", {
        room_id: id,
        added: entity_id,
    });
}
/**
 * passer par méthodes du World à la place
 * @param {RoomRepo} repo 
 * @param {RoomID} id
 * @param {EntityID} entity_id
 */
export function room_remove_entity(repo, id, entity_id) {
    const room = undefined_unwrap(repository_get(repo, id));
    if (!room.entities.includes(entity_id)) throw new Error(`entity_id is not in this room: ${room.id} ${entity_id}`);
    room.entities = room.entities.filter(e => e != entity_id);
    signalbus_emit(ESB, "room.entities.removed", {
        room_id: id,
        removed: entity_id,
    });
}
