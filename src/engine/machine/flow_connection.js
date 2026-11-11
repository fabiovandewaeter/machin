// engine/machine/flow_connection.js

/**
 * @import { EnumKey } from "../../utils/enum.js"
 * @import {Repo} from "../../utils/repository.js"
 * @import {FlowConnectionID, MachineID} from "../core/ids.types.js"
 * @import {ResourceAmount} from "../item/recipe.js"
 * @import {ResourceID, ResourceTag} from "../item/resource.js"
 */
import { enum_create } from "../../utils/enum.js";
import { repository_get, repository_remove_element, repository_spawn_element } from "../../utils/repository.js";
import { result_assert_ok } from "../../utils/result.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { enginesignal_emit } from "../core/signal/signal.js";
import { resource_has_any_tag } from "../item/resource.js";

export const CONNECTION_KIND = enum_create(/**@type {const} */([
    "BELT",
    "PIPE",
    "TRUCK",
]));
/**
 * @typedef {EnumKey<typeof CONNECTION_KIND>} FlowConnectionKind
 */

/**
 * @typedef {Object} FlowConnectionDefinition
 * @prop {number} max_throughput
 * @prop {ResourceTag[]} accepted_tags
 */

/** @type {Readonly<Record<FlowConnectionKind, FlowConnectionDefinition>>} */
export const FLOW_CONNECTION = Object.freeze({
    BELT: { max_throughput: 2000, accepted_tags: ["SOLID"] },
    PIPE: { max_throughput: 4000, accepted_tags: ["LIQUID"] },
    TRUCK: { max_throughput: 8000, accepted_tags: ["SOLID", "LIQUID"] },
});

/**
 * @typedef {Object} FlowConnection
 * @prop {FlowConnectionID} id
 * @prop {FlowConnectionKind} kind
 * @prop {MachineID} from
 * @prop {MachineID} to
 * @prop {number} max_throughput
 * @prop {number} manual_throughput_limit
 * @prop {ResourceAmount[]} throughput
 *
 * @typedef {Repo<FlowConnectionID, FlowConnection>} FlowConnectionRepo
 */

/**
 * @param {FlowConnectionRepo} repo
 * @param {Object} options
 * @param {FlowConnectionKind} options.kind
 * @param {MachineID} options.from
 * @param {MachineID} options.to
 * @param {number} options.max_throughput
 * @returns {FlowConnection}
 */
export function flowconnection_spawn(repo, { kind, from, to, max_throughput }) {
    const connection = repository_spawn_element(repo, {
        kind,
        from,
        to,
        max_throughput,
        manual_throughput_limit: max_throughput,
        throughput: [],
    });
    enginesignal_emit("flow_connection.added", { flow_connection_id: connection.id });
    return connection;
}

/**
 * @param {FlowConnectionRepo} repo
 * @param {FlowConnectionID} id
 */
export function flowconnection_remove(repo, id) {
    result_assert_ok(repository_remove_element(repo, id));
    enginesignal_emit("flow_connection.removed", { flow_connection_id: id });
}

/**
 * @param {FlowConnectionRepo} repo
 * @param {FlowConnectionID} id
 * @param {number} limit
 */
export function flowconnection_set_manual_throughput_limit(repo, id, limit) {
    undefined_unwrap(repository_get(repo, id)).manual_throughput_limit = limit;
    enginesignal_emit("flow_connection.manual_throughput_limit.changed", { flow_connection_id: id });
}

/**
 * @param {FlowConnection} connection
 * @param {ResourceID} resource
 * @returns {boolean}
 */
export function flowconnection_accepts(connection, resource) {
    return resource_has_any_tag(resource, FLOW_CONNECTION[connection.kind].accepted_tags);
}
