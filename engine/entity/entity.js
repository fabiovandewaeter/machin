// engine/entity/entity.js
// @ts-check

/**
 * @typedef {import("../map/room.js").RoomID} RoomID
 */
import * as ESB from "../core/signals.js";
import * as Repo from "../../utils/repository.js";
import * as Opt from "../../utils/option.js";
import * as SB from "../../utils/signal_bus.js";

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
export function spawn(repo, { name, room_id }) {
    return Repo.spawn_element(repo, {
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
export function move(repo, entity_id, target_id) {
    const entity = Opt.unwrap(Repo.get(repo, entity_id));
    const previous_room_id = entity.room_id;
    entity.room_id = target_id;
    SB.emit(ESB.BUS, "entity.room_id.changed", {
        entity_id,
        previous_room_id,
        new_room_id: target_id,
    });
    return previous_room_id;
}
