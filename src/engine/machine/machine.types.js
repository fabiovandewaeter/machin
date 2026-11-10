// engine/machine/machine.types.js

/**
 * @import { EnumKey } from "../../utils/enum.js"
 * @import {Extractor} from "./extractor.js"
 * @import {ExtractorID} from "../core/ids.types.js"
 */
import { enum_create } from "../../utils/enum.js";

export const MACHINE_KIND = enum_create(/**@type {const} */([
    "EXTRACTOR",
]));
/**
 * @typedef {EnumKey<typeof MACHINE_KIND>} MachineKind
 */

/**
 * @typedef { {kind: "EXTRACTOR", id: ExtractorID} } MachineRef
 */

/**
 * @typedef {ExtractorID} MachineID
 * @typedef {Extractor} Machine
 */

