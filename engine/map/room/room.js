// engine/map/room/room.js

/**
 * @typedef {import("../../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../atmosphere.js").Atmosphere} Atmosphere
 * @typedef {import("./room.types.js").RoomKind} RoomKind
 * @typedef {import("./room.types.js").Room} Room
 * @typedef {import("./room.types.js").RoomRepo} RoomRepo
 * @typedef {import("../../core/ids.types.js").RoomID} RoomID
 * @typedef {import("./room.types.js").RoomExit} RoomExit
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
import { repository_get, repository_spawn_element } from "../../../utils/repository.js";
import { signalbus_emit } from "../../../utils/signal_bus.js";
import { undefined_unwrap } from "../../../utils/undefined.js";
import { ESB } from "../../core/signal/signal.js";

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
