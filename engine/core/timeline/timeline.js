// engine/core/timeline/timeline.js
// @ts-check

// VOIR SI event pour referencer ou pas(avoir autre structure pour ceux à annuler ou alors parcourir et aller supprimer)

/**
 * @typedef {import("../world.js").World} World
 */
import "../../../utils/types.js"
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
}

// TODO
export function timeline_init() {
    timeline_clear_handlers();
    // Crafting.init_timeline();
    // Building.init_timeline();
}

export function timeline_clear_handlers() { }
