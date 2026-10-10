// engine/core/world.js
// @ts-check

/**
 * @typedef {import("../entity/entity.js").EntityID} EntityID
 * @typedef {import("../entity/entity.js").EntityRepo} EntityRepo
 * @typedef {import("../map/room.js").RoomID} RoomID
 * @typedef {import("../map/galaxy.js").Galaxy} Galaxy
 * @typedef {import("./clock.js").Clock} Clock
 * @typedef {import("./timeline/scheduler.js").TimelineScheduler} TimelineScheduler
 */
import { option_expect } from "../../utils/option.js";
import { repository_create, repository_get } from "../../utils/repository.js";
import "../../utils/types.js"
import { undefined_expect } from "../../utils/undefined.js";
import { entity_move, entity_spawn } from "../entity/entity.js";
import { galaxy_create, GALAXY_DEFAULT_ROOM_ID, galaxy_init } from "../map/galaxy.js";
import { room_add_entity, room_remove_entity } from "../map/room.js";
import { clock_create } from "./clock.js";
import { timelinescheduler_create, timelinescheduler_peek } from "./timeline/scheduler.js";
import { timeline_advance_to } from "./timeline/timeline.js";

/**
 * @typedef {Object} World
 * @property {Clock} clock
 * @property {TimelineScheduler} timeline_scheduler 
 * @property {Galaxy} galaxy
 * @property {EntityRepo} entity_repo
 */

/**
 * @returns {World}
 */
export function world_create() {
    return {
        clock: clock_create(null),
        timeline_scheduler: timelinescheduler_create(),
        galaxy: galaxy_create(),
        entity_repo: repository_create(),
    };
}

/**
 * @param {World} world 
 */
export function world_init(world) {
    const map = galaxy_init(world.galaxy);
    // TODO: système pour ajouter les entity directement dans leur room au spawn
    const robot_1 = entity_spawn(world.entity_repo, {
        name: "robot 1",
        room_id: GALAXY_DEFAULT_ROOM_ID
    });
    const second_entity = entity_spawn(world.entity_repo, {
        name: "entity 2",
        room_id: GALAXY_DEFAULT_ROOM_ID
    });
    const default_room = undefined_expect(repository_get(world.galaxy.room_repo, GALAXY_DEFAULT_ROOM_ID), "Room of id DEFAULT_ROOM_ID shoud exist");
    room_add_entity(world.galaxy.room_repo, default_room.id, robot_1.id);
    room_add_entity(world.galaxy.room_repo, default_room.id, second_entity.id);
}

/**
 * @param {World} world
 * @param {number} target_time
 */
export function world_advance_to(world, target_time) {
    timeline_advance_to(world, target_time);
    world.clock.sim_time = target_time;
}
/**
 * @param {World} world
 */
export function world_advance_to_now(world) { world_advance_to(world, Date.now()); }

/**
 * @param {World} world
 * @param {number} delta_ms
 */
export function world_advance_by(world, delta_ms) { world_advance_to(world, world.clock.sim_time + delta_ms); }

/**
 * @param {World} world
 * @returns {number|null} timestamp du prochain event, ou null si rien de planifié
 */
export function world_next_event_at(world) {
    const next = timelinescheduler_peek(world.timeline_scheduler);
    return next ? next.at : null;
}

/**
 * @param {World} world 
 * @param {EntityID} entity_id 
 * @param {RoomID} target_id 
 */
export function world_move_entity(world, entity_id, target_id) {
    undefined_expect(repository_get(world.entity_repo, entity_id), `entity should exist: ${entity_id}`);
    undefined_expect(repository_get(world.galaxy.room_repo, target_id), `targeted room should exist: ${target_id}`);
    /**
     * TODO: faire en sorte que move_entity vérifie si l'exit choisie existe dans la room de l'entity
     * et si les conditions sont bonnes etc.
     */
    const previous_room_id = entity_move(world.entity_repo, entity_id, target_id);
    room_remove_entity(world.galaxy.room_repo, previous_room_id, entity_id);
    room_add_entity(world.galaxy.room_repo, target_id, entity_id);
}

// /**
//  * @param {World} world
//  * @param {number} delta_ms
//  */
// export function update(world, delta_ms) {
// }
