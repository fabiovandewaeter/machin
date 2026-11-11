// engine/machine/flow.js

/**
 * @import {World} from "../core/world/world.types.js"
 * @import {MachineID} from "../core/ids.types.js"
 * @import {FlowConnection} from "./flow_connection.js"
 * @import {ResourceAmount} from "../item/recipe.js"
 * @import {ResourceID} from "../item/resource.js"
 */
import { array_get } from "../../utils/array.js";
import { assert } from "../../utils/assert.js";
import { repository_get } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { enginesignal_emit, enginesignals_batch } from "../core/signal/signal.js";
import { node_has_resource } from "../extraction/node.js";
import { flowconnection_accepts } from "./flow_connection.js";
import { machine_node, machine_recipe } from "./machine.js";

/**
 * @param {World} world
 * @returns {MachineID[]|undefined}
 */
export function flow_topological_order(world) {
    const machine_ids = world.machine_repo.elements.map(machine => machine.id);
    const incoming_counts = new Map(machine_ids.map(id => [id, 0]));
    for (const connection of world.flow_connection_repo.elements) {
        incoming_counts.set(connection.to, undefined_unwrap(incoming_counts.get(connection.to)) + 1);
    }
    const outgoing = __flow_group_by(world, connection => connection.from);
    const order = machine_ids.filter(id => incoming_counts.get(id) === 0);
    for (let index = 0; index < order.length; index++) {
        for (const connection of outgoing.get(array_get(order, index)) ?? []) {
            const count = undefined_unwrap(incoming_counts.get(connection.to)) - 1;
            incoming_counts.set(connection.to, count);
            if (count === 0) order.push(connection.to);
        }
    }
    return order.length === machine_ids.length ? order : undefined;
}

/**
 * @param {World} world
 * @param {MachineID} start
 * @param {MachineID} target
 * @returns {boolean}
 */
export function flow_is_reachable(world, start, target) {
    const outgoing = __flow_group_by(world, connection => connection.from);
    const visited = new Set([start]);
    const queue = [start];
    for (let index = 0; index < queue.length; index++) {
        const id = array_get(queue, index);
        if (id === target) return true;
        for (const connection of outgoing.get(id) ?? []) {
            if (visited.has(connection.to)) continue;
            visited.add(connection.to);
            queue.push(connection.to);
        }
    }
    return false;
}

/** @param {World} world */
export function flow_compute(world) {
    const order = flow_topological_order(world);
    assert(order, "Flow graph contains a cycle");
    const connections = world.flow_connection_repo.elements;
    const outgoing = __flow_group_by(world, connection => connection.from);
    const incoming = __flow_group_by(world, connection => connection.to);
    /** @type {Map<FlowConnection, Map<ResourceID, number>>} */
    const flows = new Map(connections.map(connection => [connection, new Map()]));
    const remaining_capacities = new Map(connections.map(connection =>
        [connection, Math.min(connection.max_throughput, connection.manual_throughput_limit)]));
    /** @type {Map<MachineID, Map<ResourceID, number>>} */
    const remaining_needs = new Map(world.machine_repo.elements.map(machine =>
        [machine.id, new Map(machine_recipe(machine)?.inputs.map(input => [input.resource, input.amount]))]));
    /** @type {Map<MachineID, ResourceAmount[]>} */
    const productions = new Map();

    for (const machine_id of order) {
        const machine = undefined_unwrap(repository_get(world.machine_repo, machine_id));
        const recipe = machine_recipe(machine);
        if (!recipe) continue;
        const node = machine_node(world.galaxy.room_repo, machine);
        const machine_incoming = incoming.get(machine_id) ?? [];
        let ratio_numerator = 1;
        let ratio_denominator = 1;
        if (!recipe.node_inputs.every(input => node_has_resource(node, input.resource))) ratio_numerator = 0;
        for (const input of recipe.inputs) {
            const received = machine_incoming.reduce((sum, connection) => sum + __flow_amount(flows, connection, input.resource), 0);
            if (received * ratio_denominator < ratio_numerator * input.amount) {
                ratio_numerator = received;
                ratio_denominator = input.amount;
            }
        }
        for (const input of recipe.inputs) {
            const consumed = Math.floor(input.amount * ratio_numerator / ratio_denominator);
            const kept = __flow_split(consumed, machine_incoming.map(connection => __flow_amount(flows, connection, input.resource)));
            machine_incoming.forEach((connection, index) => {
                undefined_unwrap(flows.get(connection)).set(input.resource, array_get(kept, index));
            });
        }
        const machine_outgoing = outgoing.get(machine_id) ?? [];
        /** @type {ResourceAmount[]} */
        const production = [];
        productions.set(machine_id, production);
        for (const output of recipe.outputs) {
            const produced = Math.floor(output.amount * ratio_numerator / ratio_denominator);
            if (produced > 0) production.push({ resource: output.resource, amount: produced });
            const target_needs = machine_outgoing.map(connection => undefined_unwrap(remaining_needs.get(connection.to)));
            const requests = machine_outgoing.map((connection, index) => flowconnection_accepts(connection, output.resource)
                ? Math.min(array_get(target_needs, index).get(output.resource) ?? 0, undefined_unwrap(remaining_capacities.get(connection)))
                : 0);
            const allocations = __flow_split(produced, requests);
            machine_outgoing.forEach((connection, index) => {
                const amount = array_get(allocations, index);
                if (amount === 0) return;
                const target_need = array_get(target_needs, index);
                target_need.set(output.resource, undefined_unwrap(target_need.get(output.resource)) - amount);
                remaining_capacities.set(connection, undefined_unwrap(remaining_capacities.get(connection)) - amount);
                const flow = undefined_unwrap(flows.get(connection));
                flow.set(output.resource, (flow.get(output.resource) ?? 0) + amount);
            });
        }
    }

    enginesignals_batch(() => {
        for (const connection of connections) {
            /** @type {ResourceAmount[]} */
            const throughput = [];
            for (const [resource, amount] of undefined_unwrap(flows.get(connection))) {
                if (amount > 0) throughput.push({ resource, amount });
            }
            if (__flow_amounts_equal(connection.throughput, throughput)) continue;
            connection.throughput = throughput;
            enginesignal_emit("flow_connection.throughput.changed", { flow_connection_id: connection.id });
        }
        for (const machine of world.machine_repo.elements) {
            const production = productions.get(machine.id) ?? [];
            if (__flow_amounts_equal(machine.production, production)) continue;
            machine.production = production;
            enginesignal_emit("machine.production.changed", { machine_id: machine.id });
        }
    });
}

/**
 * @param {World} world
 * @param {(connection: FlowConnection) => MachineID} get_machine_id
 * @returns {Map<MachineID, FlowConnection[]>}
 */
function __flow_group_by(world, get_machine_id) {
    /** @type {Map<MachineID, FlowConnection[]>} */
    const groups = new Map();
    for (const connection of world.flow_connection_repo.elements) {
        const machine_id = get_machine_id(connection);
        const group = groups.get(machine_id);
        if (group) group.push(connection);
        else groups.set(machine_id, [connection]);
    }
    return groups;
}

/**
 * @param {Map<FlowConnection, Map<ResourceID, number>>} flows
 * @param {FlowConnection} connection
 * @param {ResourceID} resource
 * @returns {number}
 */
function __flow_amount(flows, connection, resource) {
    return undefined_unwrap(flows.get(connection)).get(resource) ?? 0;
}

/**
 * @param {number} total
 * @param {number[]} requests
 * @returns {number[]}
 */
function __flow_split(total, requests) {
    const requested = requests.reduce((sum, request) => sum + request, 0);
    if (requested <= total) return requests;
    const shares = requests.map(request => Math.floor(request * total / requested));
    let remaining = total - shares.reduce((sum, share) => sum + share, 0);
    for (let index = 0; index < shares.length && remaining > 0; index++) {
        const share = array_get(shares, index);
        if (share >= array_get(requests, index)) continue;
        shares[index] = share + 1;
        remaining--;
    }
    return shares;
}

/**
 * @param {ResourceAmount[]} previous
 * @param {ResourceAmount[]} next
 * @returns {boolean}
 */
function __flow_amounts_equal(previous, next) {
    return previous.length === next.length && previous.every((entry, index) =>
        entry.resource === array_get(next, index).resource && entry.amount === array_get(next, index).amount);
}
