// engine/machine/connection.js

/**
 * @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey
 * @import {MachineRef} from "./machine.types.js"
 */
import { enum_create } from "../../utils/enum";

export const CONNECTION_KIND = enum_create(/**@type {const} */([
    "BELT",
    "PIPE",
    "TRUCK",
]));
/**
 * @typedef {EnumKey<typeof CONNECTION_KIND>} FlowConnectionKind
 */

/**
 * @typedef {Object} FlowConnectionBase
 * @property {MachineRef} machine_ref
 * @prop {number} max_throughput
 * @prop {number} throughput
 * @prop {number} manual_throughput_limit
 */

/**
 * @typedef {FlowConnectionBase & {
 *      kind: "BELT",
 * }} BeltFlowConnection
 */

/**
 * @typedef {FlowConnectionBase & {
 *      kind: "PIPE",
 * }} PipeFlowConnection
 */

