// engine/core/timeline/timeline.js

// VOIR SI event pour referencer ou pas(avoir autre structure pour ceux à annuler ou alors parcourir et aller supprimer)

/**
 * @typedef {import("../world/world.types.js").World} World
 */

import { timelinedispatcher_dispatch } from "./dispatcher.js";
import { timelinescheduler_pop_due } from "./scheduler.js";


/**
 * Fait avancer la simulation jusqu'à `target_time` en traitant, dans l'ordre,
 * tous les events planifiés dont `at <= target_time`.
 *
 * @param {World} world
 * @param {number} target_time
 */
export function timeline_advance_to(world, target_time) {
    while (true) {
        const event = timelinescheduler_pop_due(world.timeline_scheduler, target_time);
        if (!event) break;
        timelinedispatcher_dispatch(world, event);
    }
    world.clock.sim_time = target_time;
}
/**
 * @param {World} world
 */
export function timeline_advance_to_now(world) { timeline_advance_to(world, Date.now()); }
/**
 * @param {World} world
 * @param {number} delta_ms
 */
export function timeline_advance_by(world, delta_ms) { timeline_advance_to(world, world.clock.sim_time + delta_ms); }

// TODO
export function timeline_init() {
    timeline_clear_handlers();
    // Crafting.init_timeline();
    // Building.init_timeline();
}

export function timeline_clear_handlers() { }
