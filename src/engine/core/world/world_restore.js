// engine/core/world/world_restore.js

/**
 * @import {World} from "./world.types.js"
 */
import { assert } from "../../../utils/assert.js";
import { randomgenerator_is_valid } from "../../../utils/random_generator.js";
import { repository_get, repository_reindex } from "../../../utils/repository.js";
import { liquidnode_is_valid } from "../../extraction/node.js";
import { ore_create } from "../../extraction/ore.js";
import { item_is_valid } from "../../item/item.js";
import { materialitem_is_valid } from "../../item/material/material_item.js";
import { pickaxe_is_valid } from "../../item/tool/pickaxe.js";
import { flow_compute, flow_topological_order } from "../../machine/flow.js";
import { CONNECTION_KIND } from "../../machine/flow_connection.js";
import { MACHINE, machine_can_use_recipe, machine_node } from "../../machine/machine.js";
import { ROOM_KIND } from "../../map/room/room.types.js";
import { timelinedispatcher_has_handler } from "../timeline/dispatcher.js";
import { timelinescheduler_rebuild_heap } from "../timeline/scheduler.js";

/**
 * @param {unknown} value
 * @returns {World}
 */
export function world_restore(value) {
    assert(value && typeof value === "object", "Invalid world");
    const world = /** @type {World} */ (value);
    assert(world.clock && Number.isFinite(world.clock.created_at) && world.clock.created_at >= 0
        && Number.isFinite(world.clock.sim_time) && world.clock.sim_time >= world.clock.created_at, "Invalid clock");
    assert(randomgenerator_is_valid(world.random_generator), "Invalid random generator");
    const galaxy = world.galaxy;
    assert(galaxy && Array.isArray(galaxy.star_systems), "Invalid galaxy");
    repository_reindex(galaxy.star_system_repo);
    repository_reindex(galaxy.celestial_body_repo);
    repository_reindex(galaxy.region_repo);
    repository_reindex(galaxy.area_repo);
    repository_reindex(galaxy.room_repo);
    repository_reindex(world.entity_repo);
    repository_reindex(world.inventory_repo);
    repository_reindex(world.machine_repo);
    repository_reindex(world.flow_connection_repo);
    assert(world.timeline_scheduler, "Invalid timeline scheduler");
    repository_reindex(world.timeline_scheduler.repo);

    assert(galaxy.star_systems.every(id => repository_get(galaxy.star_system_repo, id) !== undefined), "Unknown star system");
    for (const system of galaxy.star_system_repo.elements) {
        assert(typeof system.name === "string" && Array.isArray(system.celestial_bodies)
            && system.celestial_bodies.every(id => repository_get(galaxy.celestial_body_repo, id) !== undefined), "Invalid star system");
    }
    for (const body of galaxy.celestial_body_repo.elements) {
        assert(typeof body.name === "string" && Array.isArray(body.orbits) && Array.isArray(body.regions)
            && body.orbits.every(id => repository_get(galaxy.celestial_body_repo, id) !== undefined)
            && body.regions.every(id => repository_get(galaxy.region_repo, id) !== undefined), "Invalid celestial body");
    }
    for (const region of galaxy.region_repo.elements) {
        assert(typeof region.name === "string" && Array.isArray(region.areas)
            && region.areas.every(id => repository_get(galaxy.area_repo, id) !== undefined), "Invalid region");
    }
    for (const area of galaxy.area_repo.elements) {
        assert(typeof area.name === "string" && Array.isArray(area.rooms)
            && area.rooms.every(id => repository_get(galaxy.room_repo, id) !== undefined), "Invalid area");
    }
    for (const inventory of world.inventory_repo.elements) {
        assert(Array.isArray(inventory.item_stack) && Number.isSafeInteger(inventory.__current_internal_item_id)
            && inventory.__current_internal_item_id >= 0, "Invalid inventory");
        const item_ids = new Set();
        for (const stack of inventory.item_stack) {
            assert(stack && Number.isSafeInteger(stack.id) && stack.id >= 0 && stack.id < inventory.__current_internal_item_id
                && !item_ids.has(stack.id) && Number.isSafeInteger(stack.amount) && stack.amount > 0
                && item_is_valid(stack.item), "Invalid inventory item");
            item_ids.add(stack.id);
        }
    }
    for (const room of galaxy.room_repo.elements) {
        assert(typeof room.name === "string" && Object.hasOwn(ROOM_KIND, room.kind) && Number.isFinite(room.layer)
            && room.exits && typeof room.exits === "object" && !Array.isArray(room.exits)
            && Array.isArray(room.content), "Invalid room");
        for (const exit of Object.values(room.exits)) {
            assert(exit && repository_get(galaxy.room_repo, exit.target_id) !== undefined, "Unknown room exit");
        }
        room.exits = Object.assign(Object.create(null), room.exits);
        const node_ids = new Set();
        for (const node of room.content) {
            assert(node && Number.isSafeInteger(node.internal_id) && node.internal_id >= 0 && !node_ids.has(node.internal_id), "Invalid node");
            node_ids.add(node.internal_id);
            if (node.kind === "LIQUID") {
                assert(liquidnode_is_valid(node), "Invalid liquid node");
                continue;
            }
            const ore = node;
            assert(ore.kind === "ORE" && Array.isArray(ore.composition)
                && ore.composition.every(stack => stack && materialitem_is_valid(stack.material_item)), "Invalid ore");
            const restored_ore = ore_create(ore);
            ore.required_mining_level = restored_ore.required_mining_level;
            ore.tool_kind = restored_ore.tool_kind;
        }
        room.entities = [];
        room.machines = [];
    }
    const owned_inventories = new Set();
    for (const entity of world.entity_repo.elements) {
        const room = repository_get(galaxy.room_repo, entity.room_id);
        assert(typeof entity.name === "string" && room
            && repository_get(world.inventory_repo, entity.inventory_id) !== undefined
            && !owned_inventories.has(entity.inventory_id)
            && (entity.tool === undefined || pickaxe_is_valid(entity.tool)), "Invalid entity");
        room.entities.push(entity.id);
        owned_inventories.add(entity.inventory_id);
    }
    const used_nodes = new Set();
    for (const machine of world.machine_repo.elements) {
        const room = repository_get(galaxy.room_repo, machine.room_id);
        assert(typeof machine.kind === "string" && Object.hasOwn(MACHINE, machine.kind) && room, "Invalid machine");
        const node = machine_node(galaxy.room_repo, machine);
        const node_key = `${machine.room_id}:${machine.node_id}`;
        assert(MACHINE[machine.kind].placed_on_node ? node !== undefined && !used_nodes.has(node_key) : machine.node_id === undefined,
            "Invalid machine node");
        assert(machine.recipe_id === undefined || machine_can_use_recipe(machine, node, machine.recipe_id), "Invalid machine recipe");
        used_nodes.add(node_key);
        room.machines.push(machine.id);
        machine.production = [];
    }
    const connection_keys = new Set();
    for (const connection of world.flow_connection_repo.elements) {
        assert(typeof connection.kind === "string" && Object.hasOwn(CONNECTION_KIND, connection.kind)
            && Number.isSafeInteger(connection.max_throughput) && connection.max_throughput >= 0
            && Number.isSafeInteger(connection.manual_throughput_limit) && connection.manual_throughput_limit >= 0
            && repository_get(world.machine_repo, connection.from) !== undefined
            && repository_get(world.machine_repo, connection.to) !== undefined
            && connection.from !== connection.to, "Invalid flow connection");
        const connection_key = `${connection.from}:${connection.to}`;
        assert(!connection_keys.has(connection_key), "Duplicate flow connection");
        connection_keys.add(connection_key);
        connection.throughput = [];
    }
    assert(flow_topological_order(world), "Flow graph contains a cycle");
    flow_compute(world);
    for (const event of world.timeline_scheduler.repo.elements) {
        assert(typeof event.kind === "string" && timelinedispatcher_has_handler(event.kind)
            && event.payload && typeof event.payload === "object", "Invalid timeline event");
    }
    timelinescheduler_rebuild_heap(world.timeline_scheduler);
    return world;
}
