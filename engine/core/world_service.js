//@ts-check
// engine/core/world_service.js

import '../../ui/types.js';
import { new_clock } from './clock_service.js';

/**
 * @returns {World}
 */
export function new_world() {
    return { clock: new_clock(null) };
}

/**
 * @param {Readonly<World>} world
 * @param {number} delta_ms
 * @returns {World}
 */
export function update_world(world, delta_ms) {
    console.log("Update " + delta_ms / 1000 + " s");
    return { ...world };
}
