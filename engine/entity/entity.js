// engine/entity/entity.js
// @ts-check

import { option_unwrap } from "../../utils/option.js";
import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { signalbus_emit } from "../../utils/signal_bus.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { ESB } from "../core/signals.js";

/**
 * @typedef {import("../map/room.js").RoomID} RoomID
 */

/**
 * @typedef {Object} Entity
 * @property {EntityID} id
 * @property {string} name
 * @property {RoomID} room_id
 * 
 * @typedef {number & {readonly __brand:"EntityID"}} EntityID
 * @typedef {import("../../utils/repository.js").Repo<EntityID, Entity>} EntityRepo
 */
// TODO: classe de départ donne boost de début mais on peut tout maxer ça va juste dépendre des combinaisons qu'on fait

/**
 * @param {EntityRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @param {RoomID} options.room_id
 * @returns {Entity}
 */
export function entity_spawn(repo, { name, room_id }) {
    return repository_spawn_element(repo, {
        name,
        room_id,
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
    signalbus_emit(ESB, "entity.room_id.changed", {
        entity_id,
        previous_room_id,
        new_room_id: target_id,
    });
    return previous_room_id;
}
