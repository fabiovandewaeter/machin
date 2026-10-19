// engine/map/room/room.js

/**
 * @typedef {import("../../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../atmosphere.js").Atmosphere} Atmosphere
 * @typedef {import("./room.types.js").RoomKind} RoomKind
 * @typedef {import("./room.types.js").Room} Room
 * @typedef {import("./room.types.js").RoomRepo} RoomRepo
 * @typedef {import("../../core/ids.types.js").RoomID} RoomID
 * @typedef {import("./room.types.js").RoomExit} RoomExit
 * @typedef {import("../../extraction/ore.js").Ore} Ore
 * @typedef {import("../../extraction/ore.js").InternalOreID} InternalOreID
 * @typedef {import("../../item/tool/tool.js").Tool} Tool
 * @typedef {import("../../extraction/ore.js").MaterialItemStack} MaterialItemStack
 * @typedef {import("../../entity/entity.types.js").EntityRepo} EntityRepo
 * @typedef {import("../../inventory.js").InventoryRepo} InventoryRepo
 */
/** @template {Record<string, unknown>} T @typedef {import("../../../utils/enum.js").EnumKey<T>} EnumKey */
/** @template T, E @typedef {import("../../../utils/result.js").Res<T, E>} Res */
import { repository_get, repository_spawn_element } from "../../../utils/repository.js";
import { err, result_is_err } from "../../../utils/result.js";
import { undefined_unwrap } from "../../../utils/undefined.js";
import { mining_mine } from "../../action/mining.js";
import { enginesignal_emit } from "../../core/signal/signal.js";

/**
 * @param {RoomRepo} repo
 * @param {Object} options
 * @param {RoomKind} options.kind
 * @param {string} options.name
 * @param {number} options.layer
 * @param {Ore[]} options.content
 * @returns {Room}
 */
export function room_spawn(repo, { kind, name, layer, content }) {
    return repository_spawn_element(repo, {
        kind,
        name,
        layer,
        exits: {},
        entities: [],
        content,
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
    enginesignal_emit("room.exits.set", {
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
    enginesignal_emit("room.entities.added", {
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
    enginesignal_emit("room.entities.removed", {
        room_id: id,
        removed: entity_id,
    });
}

/**
 * @param {RoomRepo} repo 
 * @param {RoomID} id 
 * @param {InternalOreID} ore_id 
 * @param {Tool} tool
 * @param {EntityRepo} entity_repo
 * @param {EntityID} entity_id
 * @param {InventoryRepo} inventory_repo
 * @returns {Res<MaterialItemStack[], string>}
 */
export function room_mine(repo, id, ore_id, tool, entity_repo, entity_id, inventory_repo) {
    const room = undefined_unwrap(repository_get(repo, id));
    const ore_index = room.content.findIndex((ore) => ore.internal_id === ore_id);
    if (ore_index === -1) {
        return err(`ore_id n'est pas dans room: ${ore_id} ${id}`);
    }
    const ore = undefined_unwrap(room.content[ore_index]);
    const loot_res = mining_mine(ore, tool, entity_repo, entity_id, inventory_repo);
    if (result_is_err(loot_res)) {
        return loot_res;
    }

    room.content.splice(ore_index, 1);
    enginesignal_emit("room.content.removed", {
        room_id: id,
        removed: ore_id,
    });

    return loot_res;
}
