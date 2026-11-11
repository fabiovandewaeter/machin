// engine/map/room/room.js

/**
 * @import {EntityID} from "../../core/ids.types.js"
 * @import {RoomKind} from "./room.types.js"
 * @import {Room} from "./room.types.js"
 * @import {RoomRepo} from "./room.types.js"
 * @import {RoomID} from "../../core/ids.types.js"
 * @import {RoomExit} from "./room.types.js"
 * @import {ResourceNode} from "../../extraction/node.types.js"
 * @import {__InternalNodeID} from "../../core/ids.types.js"
 * @import {MachineID} from "../../core/ids.types.js"
 */
import { assert } from "../../../utils/assert.js";
import { repository_get, repository_spawn_element } from "../../../utils/repository.js";
import { undefined_unwrap } from "../../../utils/undefined.js";
import { enginesignal_emit } from "../../core/signal/signal.js";
import { array_get } from "../../../utils/array.js";

/**
 * @param {RoomRepo} repo
 * @param {Object} options
 * @param {RoomKind} options.kind
 * @param {string} options.name
 * @param {number} options.layer
 * @param {ResourceNode[]} options.content
 * @returns {Room}
 */
export function room_spawn(repo, { kind, name, layer, content }) {
    return repository_spawn_element(repo, {
        kind,
        name,
        layer,
        exits: Object.create(null),
        entities: [],
        content,
        machines: [],
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
    undefined_unwrap(repository_get(repo, exit.target_id));
    assert(!Object.hasOwn(room.exits, name), `exit name already used for this room: ${room.id} ${name}`);
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
    assert(!room.entities.includes(entity_id), `entity_id already in this room: ${room.id} ${entity_id}`);
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
    assert(room.entities.includes(entity_id), `entity_id is not in this room: ${room.id} ${entity_id}`);
    room.entities = room.entities.filter(e => e != entity_id);
    enginesignal_emit("room.entities.removed", {
        room_id: id,
        removed: entity_id,
    });
}

/**
 * @param {RoomRepo} repo 
 * @param {RoomID} id 
 * @param {__InternalNodeID} node_id 
 * @returns {ResourceNode}
 */
export function room_remove_node(repo, id, node_id) {
    const room = undefined_unwrap(repository_get(repo, id));
    const node_index = room.content.findIndex(node => node.internal_id === node_id);

    assert(node_index !== -1, `Unknown node in room ${id}: ${node_id}`);

    const node = array_get(room.content, node_index);
    room.content.splice(node_index, 1);

    enginesignal_emit("room.content.removed", {
        room_id: id,
        removed: node_id,
    });

    return node;
}

/**
 * passer par méthodes du World à la place
 * @param {RoomRepo} repo
 * @param {RoomID} id
 * @param {MachineID} machine_id
 */
export function room_add_machine(repo, id, machine_id) {
    const room = undefined_unwrap(repository_get(repo, id));
    assert(!room.machines.includes(machine_id), `machine_id already in this room: ${room.id} ${machine_id}`);
    room.machines.push(machine_id);
    enginesignal_emit("room.machines.added", {
        room_id: id,
        added: machine_id,
    });
}

/**
 * passer par méthodes du World à la place
 * @param {RoomRepo} repo
 * @param {RoomID} id
 * @param {MachineID} machine_id
 */
export function room_remove_machine(repo, id, machine_id) {
    const room = undefined_unwrap(repository_get(repo, id));
    assert(room.machines.includes(machine_id), `machine_id is not in this room: ${room.id} ${machine_id}`);
    room.machines = room.machines.filter(m => m !== machine_id);
    enginesignal_emit("room.machines.removed", {
        room_id: id,
        removed: machine_id,
    });
}
