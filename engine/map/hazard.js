// engine/map/hazard.js
// @ts-check

import { enum_create } from "../../utils/enum.js";
import "../../utils/types.js";


export const HAZARD_KIND = enum_create(/**@type {const}*/([
    "RADIATION",
    "HEAT",
    "COLD",
    "GAVITATIONAL",
    "DEBRIS",
    // electro-magnetique ?
]));
/**
 * @typedef {EnumKey<typeof HAZARD_KIND>} HazardKind
 */

/**
 * @typedef {Object} Hazard
 * @property {HazardKind} kind
 * @property {number} intensity 0..1
 */

/**
 * @param {Object} options
 * @param {HazardKind} options.kind 
 * @param {number} options.intensity 
 * @returns {Hazard}
 */
export function hazard_create({ kind, intensity }) {
    if (intensity < 0 || intensity > 1) {
        throw new Error(`has to be between 0 and 1: ${intensity}`);
    }
    return {
        kind,
        intensity,
    }
}
