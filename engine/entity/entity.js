// engine/entity/entity.js

/**
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("./entity.types.js").EntityRepo} EntityRepo
 * @typedef {import("./entity.types.js").Entity} Entity
 * @typedef {import("../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 */
import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { __ESB, enginesignal_emit } from "../core/signal/signal.js";

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
