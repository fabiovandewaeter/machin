// engine/machine/machine.types.js

/**
 * @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey
 * @import {Extractor} from "./extractor.js"
 * @import {ExtractorID} from "../core/ids.types.js"
 */
import { enum_create } from "../../utils/enum";

export const MACHINE_KIND = enum_create(/**@type {const} */([
    "EXTRACTOR",
]));
/**
 * @typedef {EnumKey<typeof MACHINE_KIND>} MachineKind
 */

/**
 * @typedef { {kind: "EXTACTOR", id: ExtractorID} } MachineRef
 */

/**
 * @typedef {ExtractorID} MachineID
 * @typedef {Extractor} Machine
 */

