// engine/core/clock.js
// @ts-check

import '../../utils/types.js'

/**
 * @typedef {Object} Clock
 * @property {number} last_tick_timestamp
 * @property {number} accumulated_time
 */

/**
 * @param {number|null} saved_timestamp
 * @returns {Clock}
 */
export function create(saved_timestamp) {
    return { last_tick_timestamp: saved_timestamp ?? Date.now(), accumulated_time: 0 };
}

/**
 * @param {Readonly<Clock>} clock
 * @returns {[Clock,number]}
 */
export function tick(clock) {
    const now = Date.now();
    const delta_ms = now - clock.last_tick_timestamp;
    /** @type {Clock} */
    let new_clock = { ...clock, last_tick_timestamp: now, accumulated_time: clock.accumulated_time + delta_ms };
    return [new_clock, delta_ms];
}

/**
 * @param {Readonly<Clock>} clock
 * @param {number} ms
 * @returns {Clock}
 */
export function advance_clock_by(clock, ms) {
    return {
        ...clock,
        last_tick_timestamp: Date.now(),
        accumulated_time: clock.accumulated_time + ms
    };
}
