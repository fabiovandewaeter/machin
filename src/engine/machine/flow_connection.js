// engine/machine/connection.js

/**
 * @import { EnumKey } from "../../utils/enum.js"
 * @import {MachineRef} from "./machine.types.js"
 */
import { enum_create } from "../../utils/enum.js";

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
 * @prop {MachineRef} machine_ref
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

