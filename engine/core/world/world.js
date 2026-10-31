// engine/core/world/world.js

/**
 * @typedef {import("./world.types.js").World} World
 * @typedef {import("../ids.types.js").EntityID} EntityID
 * @typedef {import("../ids.types.js").RoomID} RoomID
 * @typedef {import("../../entity/entity.types.js").Entity} Entity
 * @typedef {import("../../item/tool/tool.js").Tool} Tool
 * @typedef {import("../../extraction/ore.js").__InternalOreID} __InternalOreID
 * @typedef {import("../../item/material/material_item.js").MaterialItemStack} MaterialItemStack
 */
/** @template T, E @typedef {import("../../../utils/result.js").Res<T, E>} Res */
import { repository_create, repository_get, repository_next_id } from "../../../utils/repository.js";
import { err, ok, result_is_err } from "../../../utils/result.js";
import { undefined_expect } from "../../../utils/undefined.js";
import { mining_mine } from "../../action/mining.js";
import { entity_move, entity_spawn } from "../../entity/entity.js";
import { inventory_add_item, inventory_spawn } from "../../inventory/inventory.js";
import { galaxy_create } from "../../map/galaxy.js";
import { room_add_entity, room_remove_entity, room_remove_ore } from "../../map/room/room.js";
import { clock_create } from "../clock.js";
import { enginesignals_batch } from "../signal/signal.js";
import { timelinescheduler_create, timelinescheduler_peek } from "../timeline/scheduler.js";

/** @returns {World} */
export function world_create() {
    return {
        clock: clock_create(),
        timeline_scheduler: timelinescheduler_create(),
        galaxy: galaxy_create(),
        entity_repo: repository_create(),
        inventory_repo: repository_create(),
    };
}

/**
 * @param {World} world
 * @param {{name: string, room_id: RoomID, tool?: Tool}} options
 * @returns {Entity}
 */
export function world_spawn_entity(world, { name, room_id, tool }) {
    undefined_expect(repository_get(world.galaxy.room_repo, room_id), `Unknown room: ${room_id}`);
    repository_next_id(world.entity_repo);
    repository_next_id(world.inventory_repo);
    return enginesignals_batch(() => {
        const inventory = inventory_spawn(world.inventory_repo);
        const entity = entity_spawn(world.entity_repo, { name, room_id, tool, inventory_id: inventory.id });
        room_add_entity(world.galaxy.room_repo, room_id, entity.id);
        return entity;
    });
}

/**
 * @param {World} world
 * @returns {number|null}
 */
export function world_next_event_at(world) {
    return timelinescheduler_peek(world.timeline_scheduler)?.at ?? null;
}

/**
 * @param {World} world
 * @param {EntityID} entity_id
 * @param {RoomID} target_id
 * @returns {Res<void, string>}
 */
export function world_move_entity(world, entity_id, target_id) {
    const entity = repository_get(world.entity_repo, entity_id);
    if (!entity) return err(`Unknown entity: ${entity_id}`);
    const previous_room = undefined_expect(repository_get(world.galaxy.room_repo, entity.room_id), `Unknown room: ${entity.room_id}`);
    const target_room = repository_get(world.galaxy.room_repo, target_id);
    if (!target_room) return err(`Unknown room: ${target_id}`);
    if (previous_room.id === target_id) return ok(undefined);
    if (!Object.values(previous_room.exits).some(exit => exit.target_id === target_id)) {
        return err(`Room ${target_id} is not accessible from room ${previous_room.id}`);
    }
    if (!previous_room.entities.includes(entity_id) || target_room.entities.includes(entity_id)) {
        throw new Error(`Inconsistent room membership: ${entity_id}`);
    }
    return enginesignals_batch(() => {
        entity_move(world.entity_repo, entity_id, target_id);
        room_remove_entity(world.galaxy.room_repo, previous_room.id, entity_id);
        room_add_entity(world.galaxy.room_repo, target_id, entity_id);
        return ok(undefined);
    });
}

/**
 * @param {World} world
 * @param {EntityID} entity_id
 * @param {__InternalOreID} ore_id
 * @returns {Res<MaterialItemStack[], string>}
 */
export function world_mine(world, entity_id, ore_id) {
    const entity = repository_get(world.entity_repo, entity_id);
    if (!entity) return err(`Unknown entity: ${entity_id}`);
    if (!entity.tool) return err("Mining requires a tool");
    const room = undefined_expect(repository_get(world.galaxy.room_repo, entity.room_id), `Unknown room: ${entity.room_id}`);
    const ore = room.content.find(candidate => candidate.internal_id === ore_id);
    if (!ore) return err(`Unknown ore in room ${room.id}: ${ore_id}`);
    const loot = mining_mine(ore, entity.tool);
    if (result_is_err(loot)) return loot;
    const inventory = undefined_expect(repository_get(world.inventory_repo, entity.inventory_id), `Unknown inventory: ${entity.inventory_id}`);
    const item_count = loot.value.reduce((total, stack) => total + stack.amount, 0);
    if (!Number.isSafeInteger(inventory.__current_intenal_item_id + item_count)) {
        return err("Inventory item ID limit reached");
    }
    return enginesignals_batch(() => {
        for (const stack of loot.value) {
            for (let index = 0; index < stack.amount; index++) {
                inventory_add_item(world.inventory_repo, entity.inventory_id, stack.material_item);
            }
        }
        room_remove_ore(world.galaxy.room_repo, room.id, ore_id);
        return loot;
    });
}
