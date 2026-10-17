// engine/entity/entity.js

/**
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("./entity.types.js").EntityRepo} EntityRepo
 * @typedef {import("./entity.types.js").Entity} Entity
 * @typedef {import("../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../item/item.types.js").Item} Item
 * @typedef {import("../inventory.js").InternalItemID} InternalItemID
 */
import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { __ESB, enginesignal_emit } from "../core/signal/signal.js";
import { inventory_add_item, inventory_create } from "../inventory.js";

/**
 * @param {EntityRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @param {RoomID} options.room_id
 * @param {Tool} [options.tool]
 * @returns {Entity}
 */
export function entity_spawn(repo, { name, room_id, tool }) {
    return repository_spawn_element(repo, {
        name,
        room_id,
        tool,
        inventory: inventory_create(),
    });
}

/**
 * @param {EntityRepo} repo 
 * @param {EntityID} entity_id 
 * @param {RoomID} target_id
 * @returns {RoomID}
 */
export function entity_move(repo, entity_id, target_id) {
    const entity = undefined_unwrap(repository_get(repo, entity_id));
    const previous_room_id = entity.room_id;
    entity.room_id = target_id;
    enginesignal_emit("entity.room_id.changed", {
        entity_id,
        previous_room_id,
        new_room_id: target_id,
    });
    return previous_room_id;
}

/**
 * @param {EntityRepo} repo 
 * @param {EntityID} id 
 * @param {Item} item 
 * @returns {InternalItemID}
 */
export function entity_add_item(repo, id, item) {
    const entity = undefined_unwrap(repository_get(repo, id));
    return inventory_add_item(entity.inventory, item);
}
