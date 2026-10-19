// engine/core/world/world.js

/**
 * @typedef {import("./world.types.js").World} World
 * @typedef {import("../ids.types.js").EntityID} EntityID
 * @typedef {import("../ids.types.js").RoomID} RoomID
 */
import { repository_create, repository_get } from "../../../utils/repository.js";
import { result_unwrap } from "../../../utils/result.js";
import { undefined_expect } from "../../../utils/undefined.js";
import { entity_add_item, entity_move, entity_spawn } from "../../entity/entity.js";
import { materialitem_create } from "../../item/material/material_item.js";
import { pickaxe_craft } from "../../item/tool/pickaxe.js";
import { galaxy_create, GALAXY_DEFAULT_ROOM_ID, galaxy_init } from "../../map/galaxy.js";
import { room_add_entity, room_remove_entity } from "../../map/room/room.js";
import { clock_create } from "../clock.js";
import { timelinescheduler_create, timelinescheduler_peek } from "../timeline/scheduler.js";

/**
 * @returns {World}
 */
export function world_create() {
    return {
        clock: clock_create(null),
        timeline_scheduler: timelinescheduler_create(),
        galaxy: galaxy_create(),
        entity_repo: repository_create(),
        inventory_repo: repository_create(),
    };
}

/**
 * @param {World} world 
 */
export function world_init(world) {
    galaxy_init(world.galaxy);
    // TODO: système pour ajouter les entity directement dans leur room au spawn
    const robot_1_pickaxe = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({
                kind: "ROD",
                material: "STONE",
                quality: "POOR",
            }),
            HEAD: materialitem_create({
                kind: "HEAD",
                material: "STONE",
                quality: "POOR",
            }),
        }
    }));
    const robot_1_item = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({
                kind: "ROD",
                material: "IRON",
                quality: "PERFECT",
            }),
            HEAD: materialitem_create({
                kind: "HEAD",
                material: "IRON",
                quality: "PERFECT",
            }),
        }
    }));
    const robot_1 = entity_spawn(world.entity_repo, {
        name: "robot 1",
        room_id: GALAXY_DEFAULT_ROOM_ID,
        inventory_repo: world.inventory_repo,
        tool: robot_1_pickaxe,
    });
    entity_add_item(world.entity_repo, robot_1.id, world.inventory_repo, robot_1_item);
    const second_entity_pickaxe = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({
                kind: "ROD",
                material: "STONE",
                quality: "POOR",
            }),
            HEAD: materialitem_create({
                kind: "HEAD",
                material: "STONE",
                quality: "POOR",
            }),
        }
    }));
    const second_entity = entity_spawn(world.entity_repo, {
        name: "entity 2",
        room_id: GALAXY_DEFAULT_ROOM_ID,
        inventory_repo: world.inventory_repo,
        tool: second_entity_pickaxe,
    });
    const default_room = undefined_expect(repository_get(world.galaxy.room_repo, GALAXY_DEFAULT_ROOM_ID), "Room of id DEFAULT_ROOM_ID shoud exist");
    room_add_entity(world.galaxy.room_repo, default_room.id, robot_1.id);
    room_add_entity(world.galaxy.room_repo, default_room.id, second_entity.id);
}

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
