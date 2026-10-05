// engine/map/hazard.js
// @ts-check

import "../../utils/types.js";
import * as Enum from "../../utils/enum.js";

export const HAZARD_KIND = Enum.create(/**@type {const}*/([
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
export function create({ kind, intensity }) {
    if (intensity < 0 || intensity > 1) {
        throw new Error(`has to be between 0 and 1: ${intensity}`);
    }
    return {
        kind,
        intensity,
    }
}
