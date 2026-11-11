// ui/component/factory_comp.js

/**
 * @import {DestroyFunction} from "./core/utils.js"
 * @import {MachineID} from "../../engine/core/ids.types.js"
 * @import {World} from "../../engine/core/world/world.types.js"
 * @import {ResourceNode} from "../../engine/extraction/node.types.js"
 * @import {ResourceAmount} from "../../engine/item/recipe.js"
 * @import {ResourceID} from "../../engine/item/resource.js"
 * @import {FlowConnection} from "../../engine/machine/flow_connection.js"
 * @import {Machine} from "../../engine/machine/machine.types.js"
 * @import {Room} from "../../engine/map/room/room.types.js"
 */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { flow_topological_order } from "../../engine/machine/flow.js";
import { assert } from "../../utils/assert.js";
import { repository_get } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_on } from "../core/signal/signal.js";
import { store_get } from "../core/store/store.js";
import { comp_create_comp } from "./core/comp.js";

const __BOX_WIDTH = 170;
const __BOX_HEIGHT = 60;
const __COLUMN_GAP = 70;
const __ROW_GAP = 26;
const __MARGIN = 10;

/**
 * @typedef {{x: number, y: number}} Position
 */

/** @returns {string} */
function __factorycomp_render() {
    return `
<h2>Usine</h2>
<div class="factory-status"></div>
<div class="factory-graph"></div>
sorties de l'usine: <div class="factory-outputs"></div>
machines: <div class="factory-machines"></div>
connexions: <div class="factory-connections"></div>
    `;
}

/** @param {HTMLElement} element */
function __factorycomp_update(element) {
    const { world, ui_state } = store_get();
    const entity_id = ui_state.selected_entity_id;
    const entity = entity_id === undefined ? undefined : repository_get(world.entity_repo, entity_id);
    const room = entity && repository_get(world.galaxy.room_repo, entity.room_id);
    const status = element.querySelector(".factory-status");
    const graph = element.querySelector(".factory-graph");
    const outputs_list = element.querySelector(".factory-outputs");
    const machines_list = element.querySelector(".factory-machines");
    const connections_list = element.querySelector(".factory-connections");
    assert(status && graph && outputs_list && machines_list && connections_list, "Missing factory fields");
    if (!room || room.machines.length === 0) {
        status.textContent = room ? "Aucune machine dans cette salle" : "Aucune entité sélectionnée";
        graph.replaceChildren();
        outputs_list.replaceChildren();
        machines_list.replaceChildren();
        connections_list.replaceChildren();
        return;
    }
    status.textContent = `Salle #${room.id} ${room.name}`;
    const machines = room.machines.map(machine_id => undefined_unwrap(repository_get(world.machine_repo, machine_id)));
    const connections = world.flow_connection_repo.elements.filter(connection =>
        room.machines.includes(connection.from) && room.machines.includes(connection.to));
    graph.innerHTML = __factorycomp_render_graph(world, room, machines, connections);
    outputs_list.replaceChildren(...__factorycomp_outputs(machines, connections).map(output => {
        const line = document.createElement("div");
        line.textContent = `${output.resource} ${output.amount}`;
        return line;
    }));
    machines_list.replaceChildren(...machines.map(machine => {
        const line = document.createElement("div");
        line.textContent = __factorycomp_machine_text(machine);
        return line;
    }));
    connections_list.replaceChildren(...connections.map(connection => {
        const line = document.createElement("div");
        line.textContent = `#${connection.id} ${connection.kind} ${connection.from} -> ${connection.to} : `
            + `${__factorycomp_amounts_text(connection.throughput)} `
            + `(max ${connection.max_throughput}, limite ${connection.manual_throughput_limit})`;
        return line;
    }));
}

/**
 * @param {World} world
 * @param {Room} room
 * @param {Machine[]} machines
 * @param {FlowConnection[]} connections
 * @returns {string}
 */
function __factorycomp_render_graph(world, room, machines, connections) {
    const depths = __factorycomp_machine_depths(world);
    /** @type {number[]} */
    const column_rows = [];
    /** @param {number} column @returns {Position} */
    const next_position = column => {
        const row = column_rows[column] ?? 0;
        column_rows[column] = row + 1;
        return { x: __MARGIN + column * (__BOX_WIDTH + __COLUMN_GAP), y: __MARGIN + row * (__BOX_HEIGHT + __ROW_GAP) };
    };
    const machine_columns = new Map(machines.map(machine => [machine.id, 1 + (depths.get(machine.id) ?? 0)]));
    const machine_positions = new Map(machines.map(machine => [machine.id, next_position(undefined_unwrap(machine_columns.get(machine.id)))]));
    const node_positions = new Map(room.content.map(node => {
        const machine = machines.find(candidate => candidate.node_id === node.internal_id);
        return [node.internal_id, next_position(machine ? undefined_unwrap(machine_columns.get(machine.id)) - 1 : 0)];
    }));
    const width = __MARGIN * 2 + column_rows.length * (__BOX_WIDTH + __COLUMN_GAP) - __COLUMN_GAP;
    const height = __MARGIN * 2 + column_rows.reduce((max, rows) => Math.max(max, rows), 0) * (__BOX_HEIGHT + __ROW_GAP) - __ROW_GAP;

    /** @type {string[]} */
    const node_links = [];
    for (const machine of machines) {
        const node_position = machine.node_id === undefined ? undefined : node_positions.get(machine.node_id);
        if (!node_position) continue;
        node_links.push(__factorycomp_render_edge(node_position, undefined_unwrap(machine_positions.get(machine.id)), "node-link"));
    }
    const edges = connections.map(connection => __factorycomp_render_edge(undefined_unwrap(machine_positions.get(connection.from)),
        undefined_unwrap(machine_positions.get(connection.to)), `flow-edge ${connection.kind}`));
    const edge_labels = connections.map(connection => __factorycomp_render_edge_label(
        undefined_unwrap(machine_positions.get(connection.from)), undefined_unwrap(machine_positions.get(connection.to)),
        `#${connection.id} ${connection.throughput.reduce((sum, entry) => sum + entry.amount, 0)}`));
    const node_boxes = room.content.map(node =>
        __factorycomp_render_box(undefined_unwrap(node_positions.get(node.internal_id)), "resource-node",
            `nœud #${node.internal_id}`, __factorycomp_node_text(node)));
    const machine_boxes = machines.map(machine =>
        __factorycomp_render_box(undefined_unwrap(machine_positions.get(machine.id)),
            `machine ${machine.kind}${connections.some(connection => connection.from === machine.id) ? "" : " leaf"}`,
            `${machine.kind} #${machine.id}`, machine.recipe_id ?? "sans recette", `→ ${__factorycomp_amounts_text(machine.production)}`));
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><marker id="factory-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
${[...node_links, ...edges, ...node_boxes, ...machine_boxes, ...edge_labels].join("\n")}
</svg>`;
}

/**
 * @param {World} world
 * @returns {Map<MachineID, number>}
 */
function __factorycomp_machine_depths(world) {
    /** @type {Map<MachineID, number>} */
    const depths = new Map();
    for (const machine_id of flow_topological_order(world) ?? []) {
        const depth = depths.get(machine_id) ?? 0;
        for (const connection of world.flow_connection_repo.elements) {
            if (connection.from === machine_id) depths.set(connection.to, Math.max(depths.get(connection.to) ?? 0, depth + 1));
        }
    }
    return depths;
}

/**
 * @param {Position} position
 * @param {string} class_name
 * @param {string} title
 * @param {string} subtitle
 * @param {string} [detail]
 * @returns {string}
 */
function __factorycomp_render_box({ x, y }, class_name, title, subtitle, detail = "") {
    return `<g class="${class_name}">
<rect x="${x}" y="${y}" width="${__BOX_WIDTH}" height="${__BOX_HEIGHT}" rx="4"/>
<text x="${x + 6}" y="${y + 17}">${title}</text>
<text x="${x + 6}" y="${y + 34}" class="subtitle">${subtitle}</text>
<text x="${x + 6}" y="${y + 51}" class="detail">${detail}</text>
</g>`;
}

/**
 * @param {Position} from
 * @param {Position} to
 * @returns {{x1: number, y1: number, x2: number, y2: number}}
 */
function __factorycomp_edge_points(from, to) {
    return { x1: from.x + __BOX_WIDTH, y1: from.y + __BOX_HEIGHT / 2, x2: to.x, y2: to.y + __BOX_HEIGHT / 2 };
}

/**
 * @param {Position} from
 * @param {Position} to
 * @param {string} class_name
 * @returns {string}
 */
function __factorycomp_render_edge(from, to, class_name) {
    const { x1, y1, x2, y2 } = __factorycomp_edge_points(from, to);
    return `<line class="${class_name}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#factory-arrow)"/>`;
}

/**
 * @param {Position} from
 * @param {Position} to
 * @param {string} label
 * @returns {string}
 */
function __factorycomp_render_edge_label(from, to, label) {
    const { x1, y1, x2, y2 } = __factorycomp_edge_points(from, to);
    return `<text class="edge-label" x="${x1 + (x2 - x1) * 0.35}" y="${y1 + (y2 - y1) * 0.35 - 4}" text-anchor="middle">${label}</text>`;
}

/**
 * @param {Machine[]} machines
 * @param {FlowConnection[]} connections
 * @returns {ResourceAmount[]}
 */
function __factorycomp_outputs(machines, connections) {
    /** @type {Map<ResourceID, number>} */
    const outputs = new Map();
    for (const entry of machines.flatMap(machine => machine.production)) {
        outputs.set(entry.resource, (outputs.get(entry.resource) ?? 0) + entry.amount);
    }
    for (const entry of connections.flatMap(connection => connection.throughput)) {
        outputs.set(entry.resource, (outputs.get(entry.resource) ?? 0) - entry.amount);
    }
    return [...outputs].filter(([, amount]) => amount > 0).map(([resource, amount]) => ({ resource, amount }));
}

/**
 * @param {Machine} machine
 * @returns {string}
 */
function __factorycomp_machine_text(machine) {
    const node = machine.node_id === undefined ? "" : ` sur nœud #${machine.node_id}`;
    return `#${machine.id} ${machine.kind}${node} : ${machine.recipe_id ?? "sans recette"} -> ${__factorycomp_amounts_text(machine.production)}`;
}

/**
 * @param {ResourceNode} node
 * @returns {string}
 */
function __factorycomp_node_text(node) {
    switch (node.kind) {
        case "ORE": return node.composition.map(stack => `${stack.material_item.material} x${stack.amount}`).join(", ");
        case "LIQUID": return `${node.resource} x${node.amount}`;
        default: return utils_assert_unreachable(node);
    }
}

/**
 * @param {ResourceAmount[]} amounts
 * @returns {string}
 */
function __factorycomp_amounts_text(amounts) {
    return amounts.length ? amounts.map(entry => `${entry.resource} ${entry.amount}`).join(", ") : "0";
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function factorycomp_mount(container) {
    return comp_create_comp(container, "factory-comp", (element, add_cleanup) => {
        element.innerHTML = __factorycomp_render();
        const update = () => __factorycomp_update(element);
        add_cleanup(enginesignal_on("entity.room_id.changed", update));
        add_cleanup(enginesignal_on("room.content.removed", update));
        add_cleanup(enginesignal_on("room.machines.added", update));
        add_cleanup(enginesignal_on("room.machines.removed", update));
        add_cleanup(enginesignal_on("machine.recipe_id.changed", update));
        add_cleanup(enginesignal_on("machine.production.changed", update));
        add_cleanup(enginesignal_on("flow_connection.added", update));
        add_cleanup(enginesignal_on("flow_connection.removed", update));
        add_cleanup(enginesignal_on("flow_connection.manual_throughput_limit.changed", update));
        add_cleanup(enginesignal_on("flow_connection.throughput.changed", update));
        add_cleanup(uisignal_on("ui_state.selected_entity_id.changed", update));
        update();
    });
}
