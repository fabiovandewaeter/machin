// engine/item/quality.js
// @ts-check

import { assert } from "../../tests/test";
import * as Utils from "../../utils/utils.js";

export const QUALITY = Object.freeze(/**@type {const}*/({
    POOR: { kind: "POOR", id: 0, multiplier: 0.8 },
    NORMAL: { kind: "NORMAL", id: 1, multiplier: 1.0 },
    PERFECT: { kind: "PERFECT", id: 2, multiplier: 1.3 },
}));
/**
 * @typedef {EnumKey<typeof QUALITY>} Quality
 */

/**
 * @param {Quality[]} qualities 
 * @returns {Quality}
 */
export function lowest_quality(qualities) {
    assert(qualities.length > 0);
    let lowest = QUALITY[qualities[0]];
    for (let i = 1; i < qualities.length; i++) {
        const current = QUALITY[qualities[i]];
        if (current.id < lowest.id) {
            lowest = current;
        }
    }

    return lowest.kind;
}
