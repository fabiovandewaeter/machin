// engine/core/world/world.js

/**
 * @import {World} from "./world.types.js"
 * @import {EntityID} from "../ids.types.js"
 * @import {RoomID} from "../ids.types.js"
 * @import {Entity} from "../../entity/entity.types.js"
 * @import {Tool} from "../../item/tool/tool.js"
 * @import {__InternalNodeID} from "../ids.types.js"
 * @import {MaterialItemStack} from "../../item/material/material_item.js"
 * @import {Res} from "../../../utils/result.js"
 * @import {FlowConnectionID, MachineID} from "../ids.types.js"
 * @import {RecipeID} from "../../item/recipe.js"
 * @import {Machine, MachineKind} from "../../machine/machine.types.js"
 * @import {FlowConnection, FlowConnectionKind} from "../../machine/flow_connection.js"
 */
import { assert } from "../../../utils/assert.js";
import { randomgenerator_create } from "../../../utils/random_generator.js";
import { repository_create, repository_get, repository_next_id, repository_remove_element } from "../../../utils/repository.js";
import { err, ok, result_assert_ok, result_is_err } from "../../../utils/result.js";
import { undefined_expect } from "../../../utils/undefined.js";
import { mining_mine } from "../../action/mining.js";
import { entity_move, entity_spawn } from "../../entity/entity.js";
import { inventory_add_stack, inventory_spawn } from "../../inventory/inventory.js";
import { pickaxe_is_valid } from "../../item/tool/pickaxe.js";
import { galaxy_create } from "../../map/galaxy.js";
import { flow_compute, flow_is_reachable } from "../../machine/flow.js";
import { CONNECTION_KIND, FLOW_CONNECTION, flowconnection_remove, flowconnection_set_manual_throughput_limit, flowconnection_spawn } from "../../machine/flow_connection.js";
import { MACHINE, machine_can_use_recipe, machine_node, machine_set_recipe, machine_spawn } from "../../machine/machine.js";
import { room_add_entity, room_add_machine, room_remove_entity, room_remove_machine, room_remove_node } from "../../map/room/room.js";
import { clock_create } from "../clock.js";
import { enginesignals_batch } from "../signal/signal.js";
import { timelinescheduler_create, timelinescheduler_peek } from "../timeline/scheduler.js";

/**
 * @param {{now: number, seed: number}} options
 * @returns {World}
 */
export function world_create({ now, seed }) {
    return {
        clock: clock_create(now),
        random_generator: randomgenerator_create(seed),
        timeline_scheduler: timelinescheduler_create(),
        galaxy: galaxy_create(),
        entity_repo: repository_create(),
        inventory_repo: repository_create(),
        machine_repo: repository_create(),
        flow_connection_repo: repository_create(),
    };
}

/**
 * @param {World} world
 * @param {{name: string, room_id: RoomID, tool?: Tool}} options
 * @returns {Entity}
 */
export function world_spawn_entity(world, { name, room_id, tool }) {
    undefined_expect(repository_get(world.galaxy.room_repo, room_id), `Unknown room: ${room_id}`);
    assert(tool === undefined || pickaxe_is_valid(tool), "Invalid tool");
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
    assert(previous_room.entities.includes(entity_id) && !target_room.entities.includes(entity_id),
        `Inconsistent room membership: ${entity_id}`);
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
 * @param {__InternalNodeID} ore_id
 * @returns {Res<MaterialItemStack[], string>}
 */
export function world_mine(world, entity_id, ore_id) {
    const entity = repository_get(world.entity_repo, entity_id);
    if (!entity) return err(`Unknown entity: ${entity_id}`);
    if (!entity.tool) return err("Mining requires a tool");
    const room = undefined_expect(repository_get(world.galaxy.room_repo, entity.room_id), `Unknown room: ${entity.room_id}`);
    const ore = room.content.find(candidate => candidate.internal_id === ore_id);
    if (!ore || ore.kind !== "ORE") return err(`Unknown ore in room ${room.id}: ${ore_id}`);
    if (world.machine_repo.elements.some(machine => machine.room_id === room.id && machine.node_id === ore_id)) {
        return err(`Ore ${ore_id} is used by a machine`);
    }
    const loot = mining_mine(ore, entity.tool);
    if (result_is_err(loot)) return loot;
    const inventory = undefined_expect(repository_get(world.inventory_repo, entity.inventory_id), `Unknown inventory: ${entity.inventory_id}`);
    const stacks = loot.value.filter(stack => stack.amount > 0);
    if (!Number.isSafeInteger(inventory.__current_internal_item_id + stacks.length)) {
        return err("Inventory item ID limit reached");
    }
    return enginesignals_batch(() => {
        for (const stack of stacks) {
            inventory_add_stack(world.inventory_repo, entity.inventory_id, stack.material_item, stack.amount);
        }
        room_remove_node(world.galaxy.room_repo, room.id, ore_id);
        return loot;
    });
}

/**
 * @param {World} world
 * @param {Object} options
 * @param {MachineKind} options.kind
 * @param {RoomID} options.room_id
 * @param {__InternalNodeID} [options.node_id]
 * @returns {Res<Machine, string>}
 */
export function world_place_machine(world, { kind, room_id, node_id }) {
    if (!Object.hasOwn(MACHINE, kind)) return err(`Unknown machine kind: ${kind}`);
    const room = repository_get(world.galaxy.room_repo, room_id);
    if (!room) return err(`Unknown room: ${room_id}`);
    if (MACHINE[kind].placed_on_node) {
        if (!room.content.some(node => node.internal_id === node_id)) return err(`Unknown node in room ${room_id}: ${node_id}`);
        if (world.machine_repo.elements.some(machine => machine.room_id === room_id && machine.node_id === node_id)) {
            return err(`Node ${node_id} is already used by a machine`);
        }
    } else if (node_id !== undefined) {
        return err(`Machine ${kind} cannot be placed on a node`);
    }
    repository_next_id(world.machine_repo);
    return enginesignals_batch(() => {
        const machine = machine_spawn(world.machine_repo, { kind, room_id, node_id });
        room_add_machine(world.galaxy.room_repo, room_id, machine.id);
        return ok(machine);
    });
}

/**
 * @param {World} world
 * @param {MachineID} machine_id
 * @param {RecipeID|undefined} recipe_id
 * @returns {Res<void, string>}
 */
export function world_set_machine_recipe(world, machine_id, recipe_id) {
    const machine = repository_get(world.machine_repo, machine_id);
    if (!machine) return err(`Unknown machine: ${machine_id}`);
    if (recipe_id !== undefined && !machine_can_use_recipe(machine, machine_node(world.galaxy.room_repo, machine), recipe_id)) {
        return err(`Machine ${machine_id} cannot use recipe ${recipe_id}`);
    }
    return enginesignals_batch(() => {
        machine_set_recipe(world.machine_repo, machine_id, recipe_id);
        flow_compute(world);
        return ok(undefined);
    });
}

/**
 * @param {World} world
 * @param {MachineID} machine_id
 * @returns {Res<void, string>}
 */
export function world_remove_machine(world, machine_id) {
    const machine = repository_get(world.machine_repo, machine_id);
    if (!machine) return err(`Unknown machine: ${machine_id}`);
    const connection_ids = world.flow_connection_repo.elements
        .filter(connection => connection.from === machine_id || connection.to === machine_id)
        .map(connection => connection.id);
    return enginesignals_batch(() => {
        for (const connection_id of connection_ids) flowconnection_remove(world.flow_connection_repo, connection_id);
        room_remove_machine(world.galaxy.room_repo, machine.room_id, machine_id);
        result_assert_ok(repository_remove_element(world.machine_repo, machine_id));
        flow_compute(world);
        return ok(undefined);
    });
}

/**
 * @param {World} world
 * @param {MachineID} from
 * @param {MachineID} to
 * @param {FlowConnectionKind} kind
 * @returns {Res<FlowConnection, string>}
 */
export function world_connect_machines(world, from, to, kind) {
    if (!Object.hasOwn(CONNECTION_KIND, kind)) return err(`Unknown connection kind: ${kind}`);
    if (!repository_get(world.machine_repo, from)) return err(`Unknown machine: ${from}`);
    if (!repository_get(world.machine_repo, to)) return err(`Unknown machine: ${to}`);
    if (from === to) return err(`A machine cannot be connected to itself: ${from}`);
    if (world.flow_connection_repo.elements.some(connection => connection.from === from && connection.to === to)) {
        return err(`Connection already exists: ${from} -> ${to}`);
    }
    if (flow_is_reachable(world, to, from)) return err(`Connection would create a cycle: ${from} -> ${to}`);
    repository_next_id(world.flow_connection_repo);
    return enginesignals_batch(() => {
        const connection = flowconnection_spawn(world.flow_connection_repo, {
            kind,
            from,
            to,
            max_throughput: FLOW_CONNECTION[kind].max_throughput,
        });
        flow_compute(world);
        return ok(connection);
    });
}

/**
 * @param {World} world
 * @param {FlowConnectionID} connection_id
 * @returns {Res<void, string>}
 */
export function world_disconnect_machines(world, connection_id) {
    if (!repository_get(world.flow_connection_repo, connection_id)) return err(`Unknown flow connection: ${connection_id}`);
    return enginesignals_batch(() => {
        flowconnection_remove(world.flow_connection_repo, connection_id);
        flow_compute(world);
        return ok(undefined);
    });
}

/**
 * @param {World} world
 * @param {FlowConnectionID} connection_id
 * @param {number} limit
 * @returns {Res<void, string>}
 */
export function world_set_flow_connection_limit(world, connection_id, limit) {
    if (!repository_get(world.flow_connection_repo, connection_id)) return err(`Unknown flow connection: ${connection_id}`);
    if (!Number.isSafeInteger(limit) || limit < 0) return err(`Invalid throughput limit: ${limit}`);
    return enginesignals_batch(() => {
        flowconnection_set_manual_throughput_limit(world.flow_connection_repo, connection_id, limit);
        flow_compute(world);
        return ok(undefined);
    });
}
