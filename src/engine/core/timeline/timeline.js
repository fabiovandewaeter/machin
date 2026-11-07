// engine/core/timeline/timeline.js

/**
 * @typedef {import("../world/world.types.js").World} World
 */
import { enginesignal_emit } from "../signal/signal.js";
import { timelinedispatcher_clear_handlers, timelinedispatcher_dispatch } from "./dispatcher.js";
import { timelinescheduler_pop_due } from "./scheduler.js";

/**
 * @param {World} world
 * @param {number} target_time
 */
export function timeline_advance_to(world, target_time) {
    if (!Number.isFinite(target_time) || target_time < world.clock.sim_time) {
        throw new RangeError("Simulation time cannot move backwards");
    }
    while (true) {
        const event = timelinescheduler_pop_due(world.timeline_scheduler, target_time);
        if (!event) break;
        world.clock.sim_time = Math.max(world.clock.sim_time, event.at);
        timelinedispatcher_dispatch(world, event);
    }
    world.clock.sim_time = target_time;
    enginesignal_emit("TICK");
}

/** @param {World} world */
export function timeline_advance_to_now(world) {
    timeline_advance_to(world, Math.max(world.clock.sim_time, Date.now()));
}

/**
 * @param {World} world
 * @param {number} delta_ms
 */
export function timeline_advance_by(world, delta_ms) {
    timeline_advance_to(world, world.clock.sim_time + delta_ms);
}

export function timeline_init() {
    timeline_clear_handlers();
}

export function timeline_clear_handlers() {
    timelinedispatcher_clear_handlers();
}
