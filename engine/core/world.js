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
import "../../utils/types.js"
import * as Clock from "./clock.js";
import * as TimelineScheduler from "./timeline/scheduler.js";
import * as Timeline from "./timeline/timeline.js";
import * as Galaxy from "../map/galaxy.js";
import * as Entity from "../entity/entity.js";
import * as Repo from "../../utils/repository.js";
import * as Opt from "../../utils/option.js";
import * as SB from "../../utils/signal_bus.js";
import * as ESB from "./signals.js";
import * as UISB from "../../ui/core/signals.js";
import * as Room from "../map/room.js";

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
export function create() {
    return {
        clock: Clock.create(null),
        timeline_scheduler: TimelineScheduler.create(),
        galaxy: Galaxy.create(),
        entity_repo: Repo.create(),
    };
}

/**
 * @param {World} world 
 */
export function init(world) {
    const map = Galaxy.init(world.galaxy);
    // TODO: système pour ajouter les entity directement dans leur room au spawn
    const robot_1 = Entity.spawn(world.entity_repo, {
        name: "robot 1",
        room_id: Galaxy.DEFAULT_ROOM_ID
    });
    const second_entity = Entity.spawn(world.entity_repo, {
        name: "entity 2",
        room_id: Galaxy.DEFAULT_ROOM_ID
    });
    const default_room = Opt.expect(Repo.get(world.galaxy.room_repo, Galaxy.DEFAULT_ROOM_ID), "Room of id DEFAULT_ROOM_ID shoud exist");
    Room.add_entity(world.galaxy.room_repo, default_room.id, robot_1.id);
    Room.add_entity(world.galaxy.room_repo, default_room.id, second_entity.id);
}

/**
 * @param {World} world
 * @param {number} target_time
 */
export function advance_to(world, target_time) {
    Timeline.advance_to(world, target_time);
    world.clock.sim_time = target_time;
}
/**
 * @param {World} world
 */
export function advance_to_now(world) { advance_to(world, Date.now()); }

/**
 * @param {World} world
 * @param {number} delta_ms
 */
export function advance_by(world, delta_ms) { advance_to(world, world.clock.sim_time + delta_ms); }

/**
 * @param {World} world
 * @returns {number|null} timestamp du prochain event, ou null si rien de planifié
 */
export function next_event_at(world) {
    const next = TimelineScheduler.peek(world.timeline_scheduler);
    return next ? next.at : null;
}

/**
 * @param {World} world 
 * @param {EntityID} entity_id 
 * @param {RoomID} target_id 
 */
export function move_entity(world, entity_id, target_id) {
    Opt.expect(Repo.get(world.entity_repo, entity_id), `entity should exist: ${entity_id}`);
    Opt.expect(Repo.get(world.galaxy.room_repo, target_id), `targeted room should exist: ${target_id}`);
    /**
     * TODO: faire en sorte que move_entity vérifie si l'exit choisie existe dans la room de l'entity
     * et si les conditions sont bonnes etc.
     */
    const previous_room_id = Entity.move(world.entity_repo, entity_id, target_id);
    Room.remove_entity(world.galaxy.room_repo, previous_room_id, entity_id);
    Room.add_entity(world.galaxy.room_repo, target_id, entity_id);
}

// /**
//  * @param {World} world
//  * @param {number} delta_ms
//  */
// export function update(world, delta_ms) {
// }
